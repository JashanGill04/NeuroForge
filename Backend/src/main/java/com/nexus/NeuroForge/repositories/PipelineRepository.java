package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.Pipeline;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PipelineRepository extends JpaRepository<Pipeline, Long> {
    List<Pipeline> findByProject_IdOrderByStartedAtDesc(Long projectId);

    // Added: unscoped query for PipelineService.computePlatformKpis()
    List<Pipeline> findAllByOrderByStartedAtDesc();
}