// DeploymentRepository.java
package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.Deployment;
import com.nexus.NeuroForge.models.interfaces.DeploymentEnvironment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    boolean existsByPipeline_Project_IdAndEnvironmentAndSuccessTrue(Long projectId, DeploymentEnvironment env);
    Optional<Deployment> findTopByPipeline_Project_IdAndEnvironmentAndSuccessTrueAndPipeline_IdNotOrderByDeployedAtDesc(
            Long projectId, DeploymentEnvironment environment, Long excludePipelineId);
}