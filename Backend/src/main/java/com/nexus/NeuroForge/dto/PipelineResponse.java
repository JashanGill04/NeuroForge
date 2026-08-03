// PipelineResponse.java — [M3][Jashanpreet] what the dashboard (Sanika/Namita) reads
package com.nexus.NeuroForge.dto;

import java.time.LocalDateTime;

public class PipelineResponse {
    private Long id;
    private String status;
    private int duration;
    private String commitHash;
    private String branch;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String environment;
    private boolean deploymentSuccess;
    private int testsTotal;
    private int testsPassed;
    private int testsFailed;
    private int testsSkipped;

    public PipelineResponse(Long id, String status, int duration, String commitHash, String branch,
                            LocalDateTime startedAt, LocalDateTime finishedAt,
                            String environment, boolean deploymentSuccess,
                            int testsTotal, int testsPassed, int testsFailed, int testsSkipped) {
        this.id = id; this.status = status; this.duration = duration;
        this.commitHash = commitHash; this.branch = branch;
        this.startedAt = startedAt; this.finishedAt = finishedAt;
        this.environment = environment; this.deploymentSuccess = deploymentSuccess;
        this.testsTotal = testsTotal; this.testsPassed = testsPassed;
        this.testsFailed = testsFailed; this.testsSkipped = testsSkipped;
    }

    // getters only — response object
    public Long getId() { return id; }
    public String getStatus() { return status; }
    public int getDuration() { return duration; }
    public String getCommitHash() { return commitHash; }
    public String getBranch() { return branch; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public String getEnvironment() { return environment; }
    public boolean isDeploymentSuccess() { return deploymentSuccess; }
    public int getTestsTotal() { return testsTotal; }
    public int getTestsPassed() { return testsPassed; }
    public int getTestsFailed() { return testsFailed; }
    public int getTestsSkipped() { return testsSkipped; }
}