// PipelineWebhookRequest.java — [M3][Jashanpreet] payload GitHub Actions POSTs on build finish
package com.nexus.NeuroForge.dto;

import com.nexus.NeuroForge.models.interfaces.PipelineStatus;

public class PipelineWebhookRequest {
    private Long projectId;
    private PipelineStatus status;
    private int duration;
    private String commitHash;
    private String branch;
    private String environment; // matches DeploymentEnvironment
    private boolean deploymentSuccess;

    // getters/setters
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public PipelineStatus getStatus() { return status; }
    public void setStatus(PipelineStatus status) { this.status = status; }
    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }
    public String getCommitHash() { return commitHash; }
    public void setCommitHash(String commitHash) { this.commitHash = commitHash; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public boolean isDeploymentSuccess() { return deploymentSuccess; }
    public void setDeploymentSuccess(boolean deploymentSuccess) { this.deploymentSuccess = deploymentSuccess; }
}