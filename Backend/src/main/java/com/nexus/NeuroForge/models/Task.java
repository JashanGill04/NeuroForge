package com.nexus.NeuroForge.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime; // Add this import

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private int points;
    private String status;
    private Long assigneeId;

    // Add the completedAt field
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", nullable = false)
    @JsonIgnore
    private Sprint sprint;

    @Column(name = "is_blocked")
    private Boolean isBlocked = false;

    public Task() {
    }

    public Task(Long id, String title, int points, String status, Long assigneeId, Sprint sprint, Boolean isBlocked) {
        this.id = id;
        this.title = title;
        this.points = points;
        this.status = status;
        this.assigneeId = assigneeId;
        this.sprint = sprint;
        this.isBlocked = isBlocked;
    }

    // --- Add Getter and Setter for completedAt ---
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }


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