package com.nexus.NeuroForge.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kpi_snapshots")
public class KpiSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long projectId;


    private LocalDateTime capturedAt;
    private double uptimePercent;
    private double mttrMinutes;
    private long releasesThisMonth;
    private long rolledBackReleases;
    private double pipelineSuccessRate;
    private double avgDeployMinutes;

    public KpiSnapshot() {}

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getCapturedAt() { return capturedAt; }
    public void setCapturedAt(LocalDateTime capturedAt) { this.capturedAt = capturedAt; }
    public double getUptimePercent() { return uptimePercent; }
    public void setUptimePercent(double uptimePercent) { this.uptimePercent = uptimePercent; }
    public double getMttrMinutes() { return mttrMinutes; }
    public void setMttrMinutes(double mttrMinutes) { this.mttrMinutes = mttrMinutes; }
    public long getReleasesThisMonth() { return releasesThisMonth; }
    public void setReleasesThisMonth(long releasesThisMonth) { this.releasesThisMonth = releasesThisMonth; }
    public long getRolledBackReleases() { return rolledBackReleases; }
    public void setRolledBackReleases(long rolledBackReleases) { this.rolledBackReleases = rolledBackReleases; }
    public double getPipelineSuccessRate() { return pipelineSuccessRate; }
    public void setPipelineSuccessRate(double pipelineSuccessRate) { this.pipelineSuccessRate = pipelineSuccessRate; }
    public double getAvgDeployMinutes() { return avgDeployMinutes; }
    public void setAvgDeployMinutes(double avgDeployMinutes) { this.avgDeployMinutes = avgDeployMinutes; }
}