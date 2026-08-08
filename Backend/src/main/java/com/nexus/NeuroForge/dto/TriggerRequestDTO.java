package com.nexus.NeuroForge.dto;

public class TriggerRequestDTO {
    private Long projectId;
    private String branch;
    private String repoName;

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getRepoName() { return repoName; }
    public void setRepoName(String repoName) { this.repoName = repoName; }
}