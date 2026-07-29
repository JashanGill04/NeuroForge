package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.MilestoneRequest;
import com.nexus.NeuroForge.dto.MilestoneResponse;
import com.nexus.NeuroForge.models.Milestone;
import com.nexus.NeuroForge.models.Project;
import com.nexus.NeuroForge.repositories.MilestoneRepository;
import com.nexus.NeuroForge.repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MilestoneService {

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public MilestoneResponse createMilestone(MilestoneRequest req) {
        Project project = projectRepository.findById(req.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));
            
        Milestone milestone = new Milestone();
        milestone.setTitle(req.getTitle());
        milestone.setTargetDate(req.getTargetDate());
        milestone.setProject(project);
            
        Milestone savedMilestone = milestoneRepository.save(milestone);
        return mapToResponse(savedMilestone);
    }

    public List<MilestoneResponse> getMilestonesByProject(Long projectId) {
        return milestoneRepository.findByProjectId(projectId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    private MilestoneResponse mapToResponse(Milestone milestone) {
        MilestoneResponse res = new MilestoneResponse();
        res.setId(milestone.getId());
        res.setTitle(milestone.getTitle());
        res.setTargetDate(milestone.getTargetDate());
        if (milestone.getProject() != null) {
            res.setProjectId(milestone.getProject().getId());
        }
        return res;
    }
}