package com.nexus.NeuroForge.models;

import com.nexus.NeuroForge.models.interfaces.AlertMetric;
import com.nexus.NeuroForge.models.interfaces.AlertSeverity;
import com.nexus.NeuroForge.models.interfaces.AlertStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long projectId;
   @Enumerated(EnumType.STRING)
    private AlertMetric metric;

    @Enumerated(EnumType.STRING)
    private AlertSeverity severity;

    @Enumerated(EnumType.STRING)
    private AlertStatus status;

    private String message;
    private double value;
    private double threshold;

    private LocalDateTime triggeredAt;
    private LocalDateTime resolvedAt;

    public Alert() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AlertMetric getMetric() { return metric; }
    public void setMetric(AlertMetric metric) { this.metric = metric; }
    public AlertSeverity getSeverity() { return severity; }
    public void setSeverity(AlertSeverity severity) { this.severity = severity; }
    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public double getValue() { return value; }
    public void setValue(double value) { this.value = value; }
    public double getThreshold() { return threshold; }
    public void setThreshold(double threshold) { this.threshold = threshold; }
    public LocalDateTime getTriggeredAt() { return triggeredAt; }
    public void setTriggeredAt(LocalDateTime triggeredAt) { this.triggeredAt = triggeredAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

}