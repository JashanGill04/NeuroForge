// DeploymentRepository.java
package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.Deployment;
import com.nexus.NeuroForge.models.interfaces.DeploymentEnvironment;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    boolean existsByPipeline_Project_IdAndEnvironmentAndSuccessTrue(Long projectId, DeploymentEnvironment env);
}