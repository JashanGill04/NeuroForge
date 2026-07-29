package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.Project;
import com.nexus.NeuroForge.models.interfaces.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project,Long> {
        List<Project> findByTeamId(Long teamId);
        List<Project> findByManagerId(Long managerId);
        List<Project> findByStatus(ProjectStatus status);
        boolean existsByName(String name);
    }

