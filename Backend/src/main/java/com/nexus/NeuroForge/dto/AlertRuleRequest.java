package com.nexus.NeuroForge.dto;

import com.nexus.NeuroForge.models.interfaces.AlertMetric;
import com.nexus.NeuroForge.models.interfaces.AlertOperator;
import com.nexus.NeuroForge.models.interfaces.AlertSeverity;

public class AlertRuleRequest {
    private AlertMetric metric;
    private AlertOperator operator;
    private double thresholdValue;
    private AlertSeverity severity;
    private boolean enabled = true;

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