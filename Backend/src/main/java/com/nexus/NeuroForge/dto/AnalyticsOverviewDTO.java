package com.nexus.NeuroForge.dto;

public class AnalyticsOverviewDTO {
    private int totalSprints;
    private int projectTotalTasks;
    private int projectCompletedTasks;
    private double overallProjectCompletion;

    public int getTotalSprints() { return totalSprints; }
    public void setTotalSprints(int totalSprints) { this.totalSprints = totalSprints; }

    public int getProjectTotalTasks() { return projectTotalTasks; }
    public void setProjectTotalTasks(int projectTotalTasks) { this.projectTotalTasks = projectTotalTasks; }

    public int getProjectCompletedTasks() { return projectCompletedTasks; }
    public void setProjectCompletedTasks(int projectCompletedTasks) { this.projectCompletedTasks = projectCompletedTasks; }

    public double getOverallProjectCompletion() { return overallProjectCompletion; }
    public void setOverallProjectCompletion(double overallProjectCompletion) { this.overallProjectCompletion = overallProjectCompletion; }
}