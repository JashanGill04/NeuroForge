package com.nexus.NeuroForge.models;

// [M3][Jashanpreet] Pipeline entity — tracks a CI/CD build run.
// Linked FROM: Jenkins webhook (POST /api/pipelines/webhook), triggered by GitHub push
// Linked TO: Deployment (1:N) — one pipeline run can deploy to multiple envs
// STATUS: updated to add project/commit/timing/test fields — review with team

import com.nexus.NeuroForge.models.interfaces.PipelineStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Pipeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private PipelineStatus status;

    private int duration; // seconds

    private String commitHash;

    private String branch;

    private LocalDateTime startedAt;

    private LocalDateTime finishedAt;

    private int testsTotal;

    private int testsPassed;

    private int testsFailed;

    private int testsSkipped;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToMany(mappedBy = "pipeline", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Deployment> deployments = new ArrayList<>();

    public Pipeline() {}

    public Pipeline(Long id, PipelineStatus status, int duration) {
        this.id = id;
        this.status = status;
        this.duration = duration;
    }

    // --- getters/setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PipelineStatus getStatus() { return status; }
    public void setStatus(PipelineStatus status) { this.status = status; }
    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }
    public String getCommitHash() { return commitHash; }
    public void setCommitHash(String commitHash) { this.commitHash = commitHash; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }
    public int getTestsTotal() { return testsTotal; }
    public void setTestsTotal(int testsTotal) { this.testsTotal = testsTotal; }
    public int getTestsPassed() { return testsPassed; }
    public void setTestsPassed(int testsPassed) { this.testsPassed = testsPassed; }
    public int getTestsFailed() { return testsFailed; }
    public void setTestsFailed(int testsFailed) { this.testsFailed = testsFailed; }
    public int getTestsSkipped() { return testsSkipped; }
    public void setTestsSkipped(int testsSkipped) { this.testsSkipped = testsSkipped; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public List<Deployment> getDeployments() { return deployments; }
    public void setDeployments(List<Deployment> deployments) { this.deployments = deployments; }
}