package com.nexus.NeuroForge.dto;

import java.time.LocalDateTime;

public class ReleaseResponse {
    public Long id;
    public String version;
    public String environment;
    public String status;
    public String slot;
    public boolean active;
    public boolean approved;
    public LocalDateTime releaseDate;
    public Long deploymentId;
    public Long pipelineId;

    public ReleaseResponse() {}

    public ReleaseResponse(Long id, String version, String environment, String status, String slot,
                            boolean active, boolean approved, LocalDateTime releaseDate,
                            Long deploymentId, Long pipelineId) {
        this.id = id;
        this.version = version;
        this.environment = environment;
        this.status = status;
        this.slot = slot;
        this.active = active;
        this.approved = approved;
        this.releaseDate = releaseDate;
        this.deploymentId = deploymentId;
        this.pipelineId = pipelineId;
    }
}
