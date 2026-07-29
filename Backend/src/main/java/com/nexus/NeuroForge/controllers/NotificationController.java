package com.nexus.NeuroForge.controllers;

import com.nexus.NeuroForge.models.Notification;
import com.nexus.NeuroForge.models.User;
import com.nexus.NeuroForge.repositories.NotificationRepository;
import com.nexus.NeuroForge.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository repository;

    @Autowired
    private UserRepository userRepository;

    // Helper method to resolve the local User from the Keycloak JWT
    private User getCurrentUser(Jwt jwt) {
        String keycloakId = jwt.getSubject();
        return userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found for Keycloak ID: " + keycloakId));
    }

    @GetMapping
    public List<Notification> getAllNotifications(@AuthenticationPrincipal Jwt jwt) {
        User currentUser = getCurrentUser(jwt);
        return repository.findByUserId_IdOrderByCreatedAtDesc(currentUser.getId());
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        // Optional security enhancement: Verify the notification belongs to currentUser before modifying
        Notification notif = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notif.setRead(true);
        return repository.save(notif);
    }

    @PutMapping("/read-all")
    public void markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        User currentUser = getCurrentUser(jwt);
        List<Notification> unread = repository.findByUserId_IdAndReadFalse(currentUser.getId());

        unread.forEach(n -> n.setRead(true));
        repository.saveAll(unread);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        // Optional security enhancement: Verify the notification belongs to currentUser before deleting
        repository.deleteById(id);
    }
}