package com.nexus.NeuroForge.dto;

public class CreateReleaseRequest {
    private Long deploymentId;
    private boolean approved;

    public Long getDeploymentId() { return deploymentId; }
    public void setDeploymentId(Long deploymentId) { this.deploymentId = deploymentId; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
}
