package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.models.Notification;
import com.nexus.NeuroForge.models.Task;
import com.nexus.NeuroForge.models.User;
import com.nexus.NeuroForge.repositories.NotificationRepository;
import com.nexus.NeuroForge.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// NOTIFICATION FIX: this replaces what KafkaConsumerService.consumeTaskEvent used to do —
// look up a task's assignee and save a Notification for them. Previously that only happened
// asynchronously after a TaskEvent round-tripped through Kafka; now that Kafka is disabled,
// callers (TaskService, BlockerController, etc.) invoke this directly and synchronously
// instead of publishing an event.
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public void createNotification(Task task, String eventType, String message) {
        if (task == null || task.getAssigneeId() == null) {
            return;
        }

        User assignedUser = userRepository.findById(task.getAssigneeId()).orElse(null);
        if (assignedUser == null) {
            System.out.println("⚠️ Could not find User with ID: " + task.getAssigneeId() + " — skipping notification.");
            return;
        }

        Notification notification = new Notification();
        notification.setType(eventType);
        notification.setMessage(message);
        notification.setUserId(assignedUser);
        notificationRepository.save(notification);
    }
}