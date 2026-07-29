package com.nexus.NeuroForge.controllers;

import com.nexus.NeuroForge.dto.MilestoneRequest;
import com.nexus.NeuroForge.dto.MilestoneResponse;
import com.nexus.NeuroForge.services.MilestoneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/milestones")
public class MilestoneController {

    @Autowired
    private MilestoneService milestoneService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<MilestoneResponse> createMilestone(@RequestBody MilestoneRequest req) {
        return ResponseEntity.ok(milestoneService.createMilestone(req));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<MilestoneResponse>> getProjectMilestones(@PathVariable Long projectId) {
        return ResponseEntity.ok(milestoneService.getMilestonesByProject(projectId));
    }
}