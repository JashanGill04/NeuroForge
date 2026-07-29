// PipelineKpiDTO.java — [M3][Jashanpreet] stat cards for the dashboard header
package com.nexus.NeuroForge.dto;

public class PipelineKpiDTO {
    private long totalBuilds;
    private double successRate;   // e.g. 97.4
    private double avgDeployTimeMinutes;
    private long buildsToday;

    public PipelineKpiDTO(long totalBuilds, double successRate, double avgDeployTimeMinutes, long buildsToday) {
        this.totalBuilds = totalBuilds;
        this.successRate = successRate;
        this.avgDeployTimeMinutes = avgDeployTimeMinutes;
        this.buildsToday = buildsToday;
    }

    public long getTotalBuilds() { return totalBuilds; }
    public double getSuccessRate() { return successRate; }
    public double getAvgDeployTimeMinutes() { return avgDeployTimeMinutes; }
    public long getBuildsToday() { return buildsToday; }
}