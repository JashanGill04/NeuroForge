// DeploymentRepository.java
package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
}