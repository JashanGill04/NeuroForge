package com.nexus.NeuroForge.models;

// [M3][Jashanpreet] Release entity — a versioned release tied to one deployment.
// STATUS: added deployment link + releaseDate

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
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
}