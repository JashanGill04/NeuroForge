package com.nexus.NeuroForge.services;


import com.nexus.NeuroForge.dto.UserResponse;
import com.nexus.NeuroForge.models.interfaces.Role;
import com.nexus.NeuroForge.models.Team;
import com.nexus.NeuroForge.models.User;
import com.nexus.NeuroForge.repositories.TeamRepository;
import com.nexus.NeuroForge.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TeamRepository teamRepository;


    // Inside UserService.java

    // Update this method to return UserResponse
    @Transactional
    public UserResponse assignRole(long userId, Role role){
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        currentUser.setRole(role);
        return toResponse(userRepository.save(currentUser));
    }

    // Update this method to return UserResponse
    @Transactional
    public UserResponse assignUserToTeam(Long userId, Long teamId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (teamId == null) {
            user.setTeam(null);
        } else {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new RuntimeException("Team not found with ID: " + teamId));
            user.setTeam(team);
        }
        return toResponse(userRepository.save(user));
    }

    // Add this helper method at the bottom!
    public UserResponse toResponse(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);

        if (user.getTeam() != null) {
            dto.setTeamId(user.getTeam().getId());
            dto.setTeamName(user.getTeam().getName());
        }
        return dto;
    }

}
