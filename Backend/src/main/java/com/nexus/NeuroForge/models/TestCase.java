package com.nexus.NeuroForge.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nexus.NeuroForge.models.interfaces.TestResult;
import jakarta.persistence.*;

@Entity
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;   // was missing — needed to display individual test names

    @Enumerated(EnumType.STRING)
    private TestResult result;

    private double coverage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id")
    @JsonIgnore
    private Pipeline pipeline;

    public TestCase() {}

    public TestCase(Long id, TestResult result, double coverage) {
        this.id = id; this.result = result; this.coverage = coverage;
    }

    // existing getters/setters, plus:
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Pipeline getPipeline() { return pipeline; }
    public void setPipeline(Pipeline pipeline) { this.pipeline = pipeline; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TestResult getResult() { return result; }
    public void setResult(TestResult result) { this.result = result; }
    public double getCoverage() { return coverage; }
    public void setCoverage(double coverage) { this.coverage = coverage; }
}