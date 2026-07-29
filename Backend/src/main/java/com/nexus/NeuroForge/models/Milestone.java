package com.nexus.NeuroForge.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private LocalDate targetDate;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    // --- NEW: Link milestones to sprints ---
    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sprint> sprints = new ArrayList<>();
    // ----------------------------------------

    public Milestone() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public List<Sprint> getSprints() { return sprints; }
    public void setSprints(List<Sprint> sprints) { this.sprints = sprints; }
}