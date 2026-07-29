package com.nexus.NeuroForge.controllers;

import com.nexus.NeuroForge.dto.ProjectRequest;
import com.nexus.NeuroForge.dto.ProjectResponse;
import com.nexus.NeuroForge.dto.ProjectStatusUpdateRequest;
import com.nexus.NeuroForge.services.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectRequest req,
                                                         @AuthenticationPrincipal Jwt jwt) {
        String creatorUsername = jwt.getClaimAsString("preferred_username");
        return ResponseEntity.ok(projectService.createProject(req, creatorUsername));
    }
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/getProject")
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAll());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    @PostMapping("/{id}/assign-team")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROJECT_MANAGER')")
    public ResponseEntity<ProjectResponse> assignTeam(
            @PathVariable Long id, @RequestParam Long teamId) {
        return ResponseEntity.ok(projectService.assignTeam(id, teamId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROJECT_MANAGER')")
    public ResponseEntity<ProjectResponse> updateStatus(
            @PathVariable Long id, @RequestBody ProjectStatusUpdateRequest req) {
        return ResponseEntity.ok(projectService.updateStatus(id, req.getStatus()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}