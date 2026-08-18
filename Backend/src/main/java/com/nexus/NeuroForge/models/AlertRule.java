package com.nexus.NeuroForge.models;

import com.nexus.NeuroForge.models.interfaces.AlertMetric;
import com.nexus.NeuroForge.models.interfaces.AlertOperator;
import com.nexus.NeuroForge.models.interfaces.AlertSeverity;
import jakarta.persistence.*;

@Entity
@Table(name = "alert_rules")
public class AlertRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private AlertMetric metric;

    @Enumerated(EnumType.STRING)
    private AlertOperator operator;
    private Long projectId;

    private double thresholdValue;

    @Enumerated(EnumType.STRING)
    private AlertSeverity severity;

    private boolean enabled = true;

    public AlertRule() {}

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AlertMetric getMetric() { return metric; }
    public void setMetric(AlertMetric metric) { this.metric = metric; }
    public AlertOperator getOperator() { return operator; }
    public void setOperator(AlertOperator operator) { this.operator = operator; }
    public double getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(double thresholdValue) { this.thresholdValue = thresholdValue; }
    public AlertSeverity getSeverity() { return severity; }
    public void setSeverity(AlertSeverity severity) { this.severity = severity; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}