package com.nexus.NeuroForge.models;

import com.nexus.NeuroForge.models.interfaces.TestResult;
import jakarta.persistence.*;

@Entity
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TestResult result;

    private double coverage;

    public TestCase() {
    }

    public TestCase(Long id, TestResult result, double coverage) {
        this.id = id;
        this.result = result;
        this.coverage = coverage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TestResult getResult() {
        return result;
    }

    public void setResult(TestResult result) {
        this.result = result;
    }

    public double getCoverage() {
        return coverage;
    }

    public void setCoverage(double coverage) {
        this.coverage = coverage;
    }
}