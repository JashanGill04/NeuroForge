package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.SprintRequest;
import com.nexus.NeuroForge.dto.SprintResponse;
import com.nexus.NeuroForge.models.Milestone;
import com.nexus.NeuroForge.models.Project;
import com.nexus.NeuroForge.models.Sprint;
import com.nexus.NeuroForge.repositories.MilestoneRepository;
import com.nexus.NeuroForge.repositories.ProjectRepository;
import com.nexus.NeuroForge.repositories.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    public SprintResponse planSprint(SprintRequest req) {
        Project project = projectRepository.findById(req.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Sprint sprint = new Sprint();
        sprint.setGoal(req.getGoal());

        // Inside planSprint method in SprintService.java:
        if (req.getMilestoneId() != null) {
            Milestone milestone = milestoneRepository.findById(req.getMilestoneId())
                    .orElseThrow(() -> new RuntimeException("Milestone not found"));
            sprint.setMilestone(milestone);
        }

        // --- UPDATED: Use start and end dates ---
        sprint.setStartDate(req.getStartDate());
        sprint.setEndDate(req.getEndDate());
        // ----------------------------------------
        sprint.setName(req.getName());

        sprint.setProject(project);

        Sprint savedSprint = sprintRepository.save(sprint);
        return mapToResponse(savedSprint);
    }

    public List<SprintResponse> getSprintsByProject(Long projectId) {
        return sprintRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SprintResponse mapToResponse(Sprint sprint) {
        SprintResponse res = new SprintResponse();
        res.setId(sprint.getId());
        res.setGoal(sprint.getGoal());
        res.setStartDate(sprint.getStartDate());
        res.setEndDate(sprint.getEndDate());
        res.setName(sprint.getName());

        if (sprint.getProject() != null) {
            res.setProjectId(sprint.getProject().getId());
        }

        // --- ADD THIS BLOCK TO MAP MILESTONE ID ---
        if (sprint.getMilestone() != null) {
            res.setMilestoneId(sprint.getMilestone().getId());
        }
        // ------------------------------------------

        return res;
    }
}