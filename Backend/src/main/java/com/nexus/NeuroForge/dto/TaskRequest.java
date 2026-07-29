package com.nexus.NeuroForge.dto;

public class TaskRequest {
    
    private String title;
    private int points;
    private Long sprintId;
    private Long assigneeId;
    private String status;

    public TaskRequest() {}

    public TaskRequest(String title, int points, Long sprintId, Long assigneeId, String status) {
        this.title = title;
        this.points = points;
        this.sprintId = sprintId;
        this.assigneeId = assigneeId;
        this.status = status;
    }

    public String getTitle() { 
        return title; 
    }
    
    public void setTitle(String title) { 
        this.title = title; 
    }

    public int getPoints() { 
        return points; 
    }
    
    public void setPoints(int points) { 
        this.points = points; 
    }

    public Long getSprintId() { 
        return sprintId; 
    }
    
    public void setSprintId(Long sprintId) { 
        this.sprintId = sprintId; 
    }

    public Long getAssigneeId() { 
        return assigneeId; 
    }
    
    public void setAssigneeId(Long assigneeId) { 
        this.assigneeId = assigneeId; 
    }

    public String getStatus() { 
        return status; 
    }
    
    public void setStatus(String status) { 
        this.status = status; 
    }
}