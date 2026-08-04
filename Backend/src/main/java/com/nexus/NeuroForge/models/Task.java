package com.nexus.NeuroForge.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private int points;
    private String status;
    private Long assigneeId;
    private LocalDateTime completedAt;

    // CHANGED: sprint is now optional. A task with sprint == null lives in the backlog.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", nullable = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private Sprint sprint;

  // REMOVE THIS:
    // @Column(name = "project_id", nullable = false)
    // private Long projectId;

    // REPLACE WITH THIS:
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private Project project;



    @Column(name = "is_blocked")
    private Boolean isBlocked = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "task_comments", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "comment")
    private List<String> comments = new ArrayList<>();

    public Task() {}

    public Task(Long id, String title, int points, String status, Long assigneeId, Sprint sprint, Boolean isBlocked) {
        this.id = id;
        this.title = title;
        this.points = points;
        this.status = status;
        this.assigneeId = assigneeId;
        this.sprint = sprint;
        this.isBlocked = isBlocked;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // Update your getters and setters to maintain compatibility:
    public Long getProject() { 
        return project != null ? project.getId() : null; 
    }
    
    public void setProject(Project project) { 
        this.project = project; 
    }

    public List<String> getComments() { return comments; }
    public void setComments(List<String> comments) { this.comments = comments; }

    public Boolean getBlocked() { return isBlocked; }
    public void setBlocked(Boolean blocked) { this.isBlocked = blocked; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    public Sprint getSprint() { return sprint; }
    public void setSprint(Sprint sprint) { this.sprint = sprint; }
    public Boolean getIsBlocked() { return isBlocked != null ? isBlocked : false; }
    public void setIsBlocked(Boolean blocked) { this.isBlocked = blocked; }
}