package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.ProjectIntegration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProjectIntegrationRepository extends JpaRepository<ProjectIntegration, Long> {
    Optional<ProjectIntegration> findByProject_Id(Long projectId);
}