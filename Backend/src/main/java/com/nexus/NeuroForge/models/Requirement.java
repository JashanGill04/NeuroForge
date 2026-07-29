package com.nexus.NeuroForge.models;

import com.nexus.NeuroForge.models.interfaces.RequirementPriority;
import jakarta.persistence.*;

@Entity
public class Requirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @Enumerated(EnumType.STRING)
    private RequirementPriority priority;

    public Requirement() {
    }

    public Requirement(Long id, String description, RequirementPriority priority) {
        this.id = id;
        this.description = description;
        this.priority = priority;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RequirementPriority getPriority() {
        return priority;
    }

    public void setPriority(RequirementPriority priority) {
        this.priority = priority;
    }
}