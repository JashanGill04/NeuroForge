package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.events.TaskEvent;
import com.nexus.NeuroForge.models.Notification;
import com.nexus.NeuroForge.models.Task;
import com.nexus.NeuroForge.models.User;
import com.nexus.NeuroForge.repositories.NotificationRepository;
import com.nexus.NeuroForge.repositories.TaskRepository;
import com.nexus.NeuroForge.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @KafkaListener(topics = "task-events", groupId = "neuroforge-task-events-group")
    public void consumeTaskEvent(TaskEvent event) {
        System.out.println("=========================================");
        System.out.println("🔔 KAFKA LISTENER RECEIVED NEW EVENT!");
        System.out.println("Event Type: " + event.getEventType());
        System.out.println("Task ID:    " + event.getTaskId());
        System.out.println("Message:    " + event.getMessage());
        System.out.println("=========================================");

        try {
            // 1. Parse the Task ID from the event
            Long taskId = Long.parseLong(event.getTaskId());

            // 2. Fetch the Task to find out who is assigned
            Task task = taskRepository.findById(taskId).orElse(null);

            if (task != null && task.getAssigneeId() != null) {
                // 3. Fetch the actual User entity
                User assignedUser = userRepository.findById(task.getAssigneeId()).orElse(null);

                if (assignedUser != null) {
                    // 4. Create and save the Notification
                    Notification notification = new Notification();
                    notification.setType(event.getEventType());
                    notification.setMessage(event.getMessage());
                    notification.setUserId(assignedUser); // Relates to the User entity

                    notificationRepository.save(notification);
                    System.out.println("✅ Notification saved to DB for user: " + assignedUser.getUsername());
                } else {
                    System.out.println("⚠️ Could not find User with ID: " + task.getAssigneeId());
                }
            } else {
                System.out.println("ℹ️ Task is unassigned or not found, skipping notification.");
            }

        } catch (Exception e) {
            System.err.println("❌ Failed to process and save notification: " + e.getMessage());
        }
    }
}