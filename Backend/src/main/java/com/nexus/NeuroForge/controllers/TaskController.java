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
    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<Task>> getTasksForSprint(@PathVariable Long sprintId) {
        return ResponseEntity.ok(taskService.getTasksForSprint(sprintId));
    }
}