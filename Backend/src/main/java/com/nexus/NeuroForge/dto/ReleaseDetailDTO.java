package com.nexus.NeuroForge.dto;

import java.time.LocalDateTime;

public class ReleaseDetailDTO {
    public Long id;
    public String version;
    public String environment;
    public String status;
    public String slot;
    public boolean active;
    public boolean approved;
    public LocalDateTime releaseDate;

    public DeploymentInfo deployment;
    public PipelineInfo pipeline;

    public static class DeploymentInfo {
        public Long id;
        public String imageTag;
        public int podsRunning;
        public int podsTotal;
        public double cpuPercent;
        public double memoryPercent;
        public boolean success;
    }

    public static class PipelineInfo {
        public Long id;
        public String branch;
        public String commitHash;
        public String commitMessage;
    }
}
