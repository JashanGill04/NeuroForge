package com.nexus.NeuroForge.dto;

import java.util.Map; // Add this import

public class SprintProgressDTO {
    private int totalTasks;
    private int completedTasks;
    private int blockedTasks;
    private int totalPoints;
    private int completedPoints;
    private double progressPercentage;

    // NEW: Field to track the burndown timeline (Date String -> Remaining Points)
    private Map<String, Integer> burndownData;

    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }

    public int getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }

    public int getBlockedTasks() { return blockedTasks; }
    public void setBlockedTasks(int blockedTasks) { this.blockedTasks = blockedTasks; }

    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }

    public int getCompletedPoints() { return completedPoints; }
    public void setCompletedPoints(int completedPoints) { this.completedPoints = completedPoints; }

    public double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(double progressPercentage) { this.progressPercentage = progressPercentage; }

    // --- NEW Getters and Setters ---
    public Map<String, Integer> getBurndownData() { return burndownData; }
    public void setBurndownData(Map<String, Integer> burndownData) { this.burndownData = burndownData; }
}