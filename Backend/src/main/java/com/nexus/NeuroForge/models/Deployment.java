package com.nexus.NeuroForge.models;

// [M3][Jashanpreet] Deployment entity — one deploy attempt to one environment.
// Linked TO: Pipeline (N:1, owning side), Release (1:1)
// STATUS: added pipeline/release links + timestamp

import com.nexus.NeuroForge.models.interfaces.DeploymentEnvironment;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Deployment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private DeploymentEnvironment environment;

    private boolean success;

    private LocalDateTime deployedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id")
    private Pipeline pipeline;

    @OneToOne(mappedBy = "deployment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Release release;

    public Deployment() {}

    public Deployment(Long id, DeploymentEnvironment environment, boolean success) {
        this.id = id;
        this.environment = environment;
        this.success = success;
    }

    // --- getters/setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public DeploymentEnvironment getEnvironment() { return environment; }
    public void setEnvironment(DeploymentEnvironment environment) { this.environment = environment; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public LocalDateTime getDeployedAt() { return deployedAt; }
    public void setDeployedAt(LocalDateTime deployedAt) { this.deployedAt = deployedAt; }
    public Pipeline getPipeline() { return pipeline; }
    public void setPipeline(Pipeline pipeline) { this.pipeline = pipeline; }
    public Release getRelease() { return release; }
    public void setRelease(Release release) { this.release = release; }
}