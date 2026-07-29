package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team,Long> {
    boolean existsByName(String name);
}
