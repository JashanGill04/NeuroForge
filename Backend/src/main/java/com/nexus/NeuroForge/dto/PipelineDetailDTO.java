package com.nexus.NeuroForge.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PipelineDetailDTO {
    public Long id;
    public String status;
    public String branch;
    public String commitHash;
    public String commitMessage;
    public String triggerSource;
    public int duration;
    public LocalDateTime startedAt;
    public LocalDateTime finishedAt;
    public List<StageInfo> stages;
    public TestInfo tests;
    public DeployInfo deployment;

    public static class StageInfo {
        public String name;
        public String status;
        public int durationSeconds;
    }
    public static class TestInfo {
    public int passed;
    public int failed;
    public int skipped;
    public double coveragePercent;
}
    public static class DeployInfo {
        public Long id;   // NEW
        public String environment;
        public boolean success;
        public String imageTag;
        public int podsRunning;
        public int podsTotal;
        public double cpuPercent;
        public double memoryPercent;
        public boolean rollbackEligible;
    }
}