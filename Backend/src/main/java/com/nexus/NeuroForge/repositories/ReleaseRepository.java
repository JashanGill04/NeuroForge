package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.Release;
import com.nexus.NeuroForge.models.interfaces.DeploymentEnvironment;
import com.nexus.NeuroForge.models.interfaces.ReleaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReleaseRepository extends JpaRepository<Release, Long> {

    Optional<Release> findByDeployment_Id(Long deploymentId);

    Optional<Release> findTopByEnvironmentAndActiveTrueOrderByReleaseDateDesc(DeploymentEnvironment environment);

    List<Release> findByEnvironmentOrderByReleaseDateDesc(DeploymentEnvironment environment);

    List<Release> findByStatusOrderByReleaseDateDesc(ReleaseStatus status);

    List<Release> findAllByOrderByReleaseDateDesc();

    long countByReleaseDateBetween(LocalDateTime start, LocalDateTime end);
}
