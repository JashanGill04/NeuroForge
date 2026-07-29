package com.nexus.NeuroForge.controllers;


import com.nexus.NeuroForge.dto.TeamRequest;
import com.nexus.NeuroForge.dto.TeamResponse;
import com.nexus.NeuroForge.services.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<TeamResponse>> getAllTeams(){
        return ResponseEntity.ok(teamService.getAll());

    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getTeam(@PathVariable Long id){
        return ResponseEntity.ok(teamService.getById(id));

    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROJECT_MANAGER')")
    public ResponseEntity<TeamResponse> createTeam(@RequestBody TeamRequest req){
        return ResponseEntity.ok(teamService.createTeam(req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }


}
