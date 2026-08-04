package com.nexus.NeuroForge.controllers;

import com.nexus.NeuroForge.dto.TaskRequest;
import com.nexus.NeuroForge.models.Task;
import com.nexus.NeuroForge.services.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER')")
    @PostMapping("/create")
    public ResponseEntity<Task> createTask(@RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER')")
    @PatchMapping("/{taskId}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long taskId, @RequestParam String status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(taskId, status));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @PatchMapping("/{taskId}/assign/{userId}")
    public ResponseEntity<Task> assignUserToTask(@PathVariable Long taskId, @PathVariable Long userId) {
        return ResponseEntity.ok(taskService.assignUserToTask(taskId, userId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER')")
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER')")
    @PatchMapping("/{taskId}/block")
    public ResponseEntity<Task> toggleTaskBlock(@PathVariable Long taskId, @RequestParam Boolean isBlocked) {
        return ResponseEntity.ok(taskService.toggleBlockStatus(taskId, isBlocked));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'DEVOPS')")
    @PostMapping("/{taskId}/addComments")
    public ResponseEntity<Task> addComment(@PathVariable Long taskId, @RequestBody String comment) {
        return ResponseEntity.ok(taskService.addComments(taskId, comment));
    }

    // NEW: persists description edits from TaskDetailModal — this is the endpoint the modal was missing.
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER')")
    @PatchMapping("/{taskId}/description")
    public ResponseEntity<Task> updateDescription(@PathVariable Long taskId, @RequestBody String description) {
        return ResponseEntity.ok(taskService.updateDescription(taskId, description));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'DEVOPS')")
    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<Task>> getTasksForSprint(@PathVariable Long sprintId) {
        return ResponseEntity.ok(taskService.getTasksForSprint(sprintId));
    }

    // NEW: real backlog — unscheduled tasks for a project.
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'TESTER', 'DEVOPS')")
    @GetMapping("/backlog/{projectId}")
    public ResponseEntity<List<Task>> getBacklogTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getBacklogTasks(projectId));
    }

    // NEW: moves a backlog task into a sprint ("Add to sprint" in the UI).
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER')")
    @PatchMapping("/{taskId}/schedule/{sprintId}")
    public ResponseEntity<Task> scheduleTaskIntoSprint(@PathVariable Long taskId, @PathVariable Long sprintId) {
        return ResponseEntity.ok(taskService.scheduleTaskIntoSprint(taskId, sprintId));
    }
}