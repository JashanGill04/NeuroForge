package com.nexus.NeuroForge.dto;

import java.util.List;

public class TaskRequest {

    private String title;
    private int points;
    private Long sprintId;   // now optional — null means "create in the backlog, unscheduled"
    private Long projectId;  // NEW — required when sprintId is null
    private Long assigneeId;
    private String status;
    private List<String> comments;
    private String description;

    public TaskRequest() {}

    public TaskRequest(String title, int points, Long sprintId, Long projectId, Long assigneeId, String status, List<String> comments, String description) {
        this.title = title;
        this.points = points;
        this.sprintId = sprintId;
        this.projectId = projectId;
        this.assigneeId = assigneeId;
        this.status = status;
        this.comments = comments;
        this.description = description;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public Long getSprintId() { return sprintId; }
    public void setSprintId(Long sprintId) { this.sprintId = sprintId; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<String> getComments() { return comments; }
    public void setComments(List<String> comments) { this.comments = comments; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}