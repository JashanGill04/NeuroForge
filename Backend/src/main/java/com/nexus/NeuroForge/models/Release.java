package com.nexus.NeuroForge.models;

// [M4][Jashanpreet] Release entity — a versioned release tied to one deployment.
// STATUS: added environment/status/slot/active for blue-green + KPI tracking

import com.nexus.NeuroForge.models.interfaces.DeploymentEnvironment;
import com.nexus.NeuroForge.models.interfaces.DeploymentSlot;
import com.nexus.NeuroForge.models.interfaces.ReleaseStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "releases") // bypass SQL reserved keyword
public class Release {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String version;

    private boolean approved;

    private LocalDateTime releaseDate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deployment_id")
    private Deployment deployment;

    // --- M4 additions ---

    // Denormalized from deployment.getEnvironment() at creation time so
    // KPI/history queries don't have to join through Deployment -> Pipeline.
    @Enumerated(EnumType.STRING)
    private DeploymentEnvironment environment;

    @Enumerated(EnumType.STRING)
    private ReleaseStatus status;

    // Which blue-green slot this release occupies in its environment.
    @Enumerated(EnumType.STRING)
    private DeploymentSlot slot;

    // True if this release is currently the one receiving live traffic
    // in its environment. Exactly one Release per environment should be
    // active at a time; ReleaseService enforces that invariant.
    private boolean active;

    public Release() {}

    public Release(Long id, String version, boolean approved) {
        this.id = id;
        this.version = version;
        this.approved = approved;
    }

    // --- getters/setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public LocalDateTime getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDateTime releaseDate) { this.releaseDate = releaseDate; }
    public Deployment getDeployment() { return deployment; }
    public void setDeployment(Deployment deployment) { this.deployment = deployment; }

    public DeploymentEnvironment getEnvironment() { return environment; }
    public void setEnvironment(DeploymentEnvironment environment) { this.environment = environment; }
    public ReleaseStatus getStatus() { return status; }
    public void setStatus(ReleaseStatus status) { this.status = status; }
    public DeploymentSlot getSlot() { return slot; }
    public void setSlot(DeploymentSlot slot) { this.slot = slot; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
