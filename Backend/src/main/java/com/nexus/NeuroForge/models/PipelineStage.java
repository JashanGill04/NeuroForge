package com.nexus.NeuroForge.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nexus.NeuroForge.models.interfaces.StageStatus;
import jakarta.persistence.*;

@Entity
public class PipelineStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;              // "Build", "Test", "Sonar", "Docker", "Deploy"
    private int sequenceOrder;

    @Enumerated(EnumType.STRING)
    private StageStatus status;

    private int durationSeconds;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id")
    @JsonIgnore
    private Pipeline pipeline;

    public PipelineStage() {}

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(int sequenceOrder) { this.sequenceOrder = sequenceOrder; }
    public StageStatus getStatus() { return status; }
    public void setStatus(StageStatus status) { this.status = status; }
    public int getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }
    public Pipeline getPipeline() { return pipeline; }
    public void setPipeline(Pipeline pipeline) { this.pipeline = pipeline; }
}