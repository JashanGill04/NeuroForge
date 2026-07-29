package com.nexus.NeuroForge.dto;


public class ProjectRequest {
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    private Long teamId;      // optional at creation, assigned later
    private Long managerId;   // the PM/Admin creating it, or assigned explicitly
}
