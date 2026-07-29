package com.nexus.NeuroForge.dto;

import com.nexus.NeuroForge.models.interfaces.ProjectStatus;

import java.time.LocalDate;

public class ProjectResponse {
    private Long id;
    private String name;
    private ProjectStatus status;
    private String teamName;
    private String managerUsername;
    private LocalDate createdAt;

    public Long getId() {
        return id;
    }

    public ProjectResponse() {
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getManagerUsername() {
        return managerUsername;
    }

    public void setManagerUsername(String managerUsername) {
        this.managerUsername = managerUsername;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }
}


