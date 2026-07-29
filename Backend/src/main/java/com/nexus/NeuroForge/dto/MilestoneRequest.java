package com.nexus.NeuroForge.dto;

import java.time.LocalDate;

public class MilestoneRequest {
    private String title;
    private LocalDate targetDate;
    private Long projectId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
}