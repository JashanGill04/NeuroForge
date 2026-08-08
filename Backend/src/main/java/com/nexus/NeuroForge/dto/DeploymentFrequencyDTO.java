package com.nexus.NeuroForge.dto;

public class DeploymentFrequencyDTO {
    private String environment;
    private long successfulDeployments;

    public DeploymentFrequencyDTO(String environment, long successfulDeployments) {
        this.environment = environment;
        this.successfulDeployments = successfulDeployments;
    }

    // Getters
    public String getEnvironment() { return environment; }
    public long getSuccessfulDeployments() { return successfulDeployments; }
}