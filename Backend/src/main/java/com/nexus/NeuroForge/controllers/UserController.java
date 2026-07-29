package com.nexus.NeuroForge.controllers;

import com.nexus.NeuroForge.dto.UserResponse;
import com.nexus.NeuroForge.models.interfaces.Role;
import com.nexus.NeuroForge.models.User;
import com.nexus.NeuroForge.repositories.UserRepository;
import com.nexus.NeuroForge.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserService userService;
    @Autowired
    UserRepository user;

    // Inside UserController.java

    @PreAuthorize("isAuthenticated()")
    @GetMapping()
    public ResponseEntity<List<UserResponse>> getUsers(){
        // Map all users to the flat DTO
        List<UserResponse> responses = user.findAll().stream()
                .map(userService::toResponse)
                .toList();
        return ResponseEntity.status(200).body(responses);
    }

    @PostMapping("/{userId}/assignRole")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> assignRole(@PathVariable Long userId, @RequestParam Role role){
        UserResponse updatedUser = userService.assignRole(userId, role);
        return ResponseEntity.status(200).body(updatedUser);
    }

    @PostMapping("/{userId}/assignTeam")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<UserResponse> assignTeam(
            @PathVariable Long userId,
            @RequestParam(required = false) Long teamId) {

        UserResponse updatedUser = userService.assignUserToTeam(userId, teamId);
        return ResponseEntity.ok(updatedUser);
    }

}
