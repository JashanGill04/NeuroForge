// PipelineRepository.java
package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.Pipeline;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PipelineRepository extends JpaRepository<Pipeline, Long> {
}