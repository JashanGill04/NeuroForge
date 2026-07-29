// ReleaseRepository.java
package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.Release;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReleaseRepository extends JpaRepository<Release, Long> {
}