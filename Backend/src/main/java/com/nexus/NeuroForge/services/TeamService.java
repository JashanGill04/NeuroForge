package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.TeamRequest;
import com.nexus.NeuroForge.dto.TeamResponse;
import com.nexus.NeuroForge.models.Team;
import com.nexus.NeuroForge.models.User;
import com.nexus.NeuroForge.repositories.TeamRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;

    public TeamResponse createTeam(TeamRequest req) {
        if (req.getName() == null || req.getName().isBlank()) {
            throw new IllegalArgumentException("Team name is required");
        }
        if (teamRepository.existsByName(req.getName())) {
            throw new IllegalArgumentException("A team with this name already exists");
        }

        Team team = new Team();
        team.setName(req.getName());
        return toResponse(teamRepository.save(team));
    }

    public List<TeamResponse> getAll() {
        return teamRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public TeamResponse getById(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Team not found: " + id));
        return toResponse(team);
    }

    public void deleteTeam(Long id) {
        if (!teamRepository.existsById(id)) {
            throw new EntityNotFoundException("Team not found: " + id);
        }
        teamRepository.deleteById(id);
    }

    private TeamResponse toResponse(Team team) {
        TeamResponse response = new TeamResponse();
        response.setId(team.getId());
        response.setName(team.getName());

        List<User> members = team.getMembers();
        if (members == null) {
            response.setMemberCount(0);
            response.setMemberUsernames(Collections.emptyList());
        } else {
            response.setMemberCount(members.size());
            response.setMemberUsernames(members.stream().map(User::getUsername).toList());
        }
        return response;
    }
}