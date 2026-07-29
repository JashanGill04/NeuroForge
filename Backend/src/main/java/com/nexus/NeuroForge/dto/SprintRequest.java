package com.nexus.NeuroForge.dto;

import java.time.LocalDate;

public class SprintRequest {
    private String name;
    private String goal;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    private LocalDate startDate;
    private LocalDate endDate;
    private Long projectId;
    private Long milestoneId; // <--- ADD THIS FIELD

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    // --- ADD GETTER & SETTER FOR MILESTONE ID ---
    public Long getMilestoneId() { return milestoneId; }
    public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }
}