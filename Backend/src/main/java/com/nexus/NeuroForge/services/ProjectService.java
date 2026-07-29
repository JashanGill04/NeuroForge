package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.ProjectRequest;
import com.nexus.NeuroForge.dto.ProjectResponse;
import com.nexus.NeuroForge.models.Project;
import com.nexus.NeuroForge.models.interfaces.ProjectStatus;
import com.nexus.NeuroForge.models.Team;
import com.nexus.NeuroForge.models.User;
import com.nexus.NeuroForge.repositories.ProjectRepository;
import com.nexus.NeuroForge.repositories.TeamRepository;
import com.nexus.NeuroForge.repositories.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProjectService {

    @Autowired
    private  ProjectRepository projectRepository;
    @Autowired
    private  TeamRepository teamRepository;
    @Autowired
    private  UserRepository userRepository;

    public ProjectResponse createProject(ProjectRequest req, String creatorUsername) {
        if (projectRepository.existsByName(req.getName())) {
            throw new IllegalArgumentException("A project with this name already exists");
        }

        Team team = null;
        if (req.getTeamId() != null) {
            team = teamRepository.findById(req.getTeamId())
                    .orElseThrow(() -> new EntityNotFoundException("Team not found: " + req.getTeamId()));
        }

        // Manager defaults to whoever is creating it, unless explicitly overridden
        User manager;
        if (req.getManagerId() != null) {
            manager = userRepository.findById(req.getManagerId())
                    .orElseThrow(() -> new EntityNotFoundException("Manager not found: " + req.getManagerId()));
        } else {
            manager = userRepository.findByUsername(creatorUsername)
                    .orElseThrow(() -> new EntityNotFoundException("Creator user not found"));
        }

        Project project = new Project();
        project.setName(req.getName());
        project.setStatus(ProjectStatus.ACTIVE);
        project.setTeam(team);
        project.setManager(manager);
        project.setCreatedAt(LocalDate.now());
        return toResponse(projectRepository.save(project));
    }

    public List<ProjectResponse> getAll() {
        return projectRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public ProjectResponse getById(Long id) {
        Project project = findProjectOrThrow(id);
        return toResponse(project);
    }

    public ProjectResponse assignTeam(Long projectId, Long teamId) {
        Project project = findProjectOrThrow(projectId);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found: " + teamId));
        project.setTeam(team);
        return toResponse(projectRepository.save(project));
    }

    public ProjectResponse updateStatus(Long projectId, ProjectStatus status) {
        Project project = findProjectOrThrow(projectId);
        project.setStatus(status);
        return toResponse(projectRepository.save(project));
    }

    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new EntityNotFoundException("Project not found: " + id);
        }
        projectRepository.deleteById(id);
    }

    private Project findProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found: " + id));
    }

    private ProjectResponse toResponse(Project p) {

        ProjectResponse response = new ProjectResponse();
        response.setId(p.getId());
        response.setName(p.getName());
        response.setStatus(p.getStatus());
        response.setTeamName(p.getTeam() != null ? p.getTeam().getName() : "Unassigned");        response.setManagerUsername(p.getManager() != null ? p.getManager().getUsername() : null);
        response.setCreatedAt(p.getCreatedAt());
        return response;

    }
}
