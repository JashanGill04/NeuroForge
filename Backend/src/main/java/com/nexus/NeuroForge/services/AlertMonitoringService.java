package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.PipelineKpiDTO;
import com.nexus.NeuroForge.dto.ReleaseKpiDTO;
import com.nexus.NeuroForge.models.Alert;
import com.nexus.NeuroForge.models.AlertRule;
import com.nexus.NeuroForge.models.Notification;
import com.nexus.NeuroForge.models.User;
import com.nexus.NeuroForge.models.interfaces.AlertMetric;
import com.nexus.NeuroForge.models.interfaces.AlertStatus;
import com.nexus.NeuroForge.models.interfaces.Role;
import com.nexus.NeuroForge.repositories.AlertRepository;
import com.nexus.NeuroForge.repositories.AlertRuleRepository;
import com.nexus.NeuroForge.repositories.NotificationRepository;
import com.nexus.NeuroForge.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class AlertMonitoringService {

    @Autowired private AlertRuleRepository alertRuleRepository;
    @Autowired private AlertRepository alertRepository;
    @Autowired private ReleaseService releaseService;
    @Autowired private PipelineService pipelineService;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationRepository notificationRepository;

    @Scheduled(fixedRate = 30000) // every 30s
    @Transactional
    public void evaluateRules() {
        List<AlertRule> rules = alertRuleRepository.findByEnabledTrue();
        if (rules.isEmpty()) return;

        Map<AlertMetric, Double> currentValues = currentMetricValues();

        for (AlertRule rule : rules) {
            Double value = currentValues.get(rule.getMetric());
            if (value == null) continue;

            boolean breached = isBreached(value, rule.getThresholdValue(), rule.getOperator());
            List<Alert> active = alertRepository.findByMetricAndStatus(rule.getMetric(), AlertStatus.ACTIVE);

            if (breached && active.isEmpty()) {
                Alert alert = new Alert();
                alert.setMetric(rule.getMetric());
                alert.setSeverity(rule.getSeverity());
                alert.setStatus(AlertStatus.ACTIVE);
                alert.setValue(value);
                alert.setThreshold(rule.getThresholdValue());
                alert.setTriggeredAt(LocalDateTime.now());
                alert.setMessage(String.format("%s is %.2f (threshold %s %.2f)",
                        rule.getMetric(), value, rule.getOperator(), rule.getThresholdValue()));
                alertRepository.save(alert);
                notifyAdmins("ALERT_TRIGGERED", alert.getMessage());
            } else if (!breached && !active.isEmpty()) {
                for (Alert alert : active) {
                    alert.setStatus(AlertStatus.RESOLVED);
                    alert.setResolvedAt(LocalDateTime.now());
                    alertRepository.save(alert);
                    notifyAdmins("ALERT_RESOLVED", rule.getMetric() + " returned to normal (" + value + ")");
                }
            }
        }
    }

    private Map<AlertMetric, Double> currentMetricValues() {
        ReleaseKpiDTO r = releaseService.getKpis();
        PipelineKpiDTO p = pipelineService.getKpis();
        Map<AlertMetric, Double> values = new EnumMap<>(AlertMetric.class);
        values.put(AlertMetric.UPTIME_PERCENT, r.uptimePercent);
        values.put(AlertMetric.MTTR_MINUTES, r.mttrMinutes);
        values.put(AlertMetric.RELEASES_THIS_MONTH, (double) r.releasesThisMonth);
        values.put(AlertMetric.ROLLED_BACK_RELEASES, (double) r.rolledBackReleases);
        values.put(AlertMetric.PIPELINE_SUCCESS_RATE, p.getSuccessRate());
        values.put(AlertMetric.AVG_DEPLOY_MINUTES, p.getAvgDeployTimeMinutes());
        return values;
    }

    private boolean isBreached(double value, double threshold, com.nexus.NeuroForge.models.interfaces.AlertOperator op) {
        return switch (op) {
            case GT -> value > threshold;
            case LT -> value < threshold;
            case GTE -> value >= threshold;
            case LTE -> value <= threshold;
        };
    }

    private void notifyAdmins(String type, String message) {
        List<User> targets = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN || u.getRole() == Role.PROJECT_MANAGER)
                .toList();
        for (User u : targets) {
            Notification n = new Notification();
            n.setType(type);
            n.setMessage(message);
            n.setUserId(u);
            notificationRepository.save(n);
        }
    }

    public List<Alert> getAllAlerts() { return alertRepository.findAllByOrderByTriggeredAtDesc(); }
    public List<AlertRule> getAllRules() { return alertRuleRepository.findAll(); }

    public AlertRule createRule(com.nexus.NeuroForge.dto.AlertRuleRequest req) {
        AlertRule rule = new AlertRule();
        applyRequest(rule, req);
        return alertRuleRepository.save(rule);
    }

    public AlertRule updateRule(Long id, com.nexus.NeuroForge.dto.AlertRuleRequest req) {
        AlertRule rule = alertRuleRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rule not found: " + id));
        applyRequest(rule, req);
        return alertRuleRepository.save(rule);
    }

    public void deleteRule(Long id) { alertRuleRepository.deleteById(id); }

    private void applyRequest(AlertRule rule, com.nexus.NeuroForge.dto.AlertRuleRequest req) {
        rule.setMetric(req.getMetric());
        rule.setOperator(req.getOperator());
        rule.setThresholdValue(req.getThresholdValue());
        rule.setSeverity(req.getSeverity());
        rule.setEnabled(req.isEnabled());
    }
}