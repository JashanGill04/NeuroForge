package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.TaskRequest;
// KAFKA DISABLED: TaskEvent import unused now that publishing is commented out below.
// import com.nexus.NeuroForge.events.TaskEvent;
import com.nexus.NeuroForge.models.Project;
import com.nexus.NeuroForge.models.Sprint;
import com.nexus.NeuroForge.models.Task;
import com.nexus.NeuroForge.repositories.ProjectRepository;
import com.nexus.NeuroForge.repositories.SprintRepository;
import com.nexus.NeuroForge.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;

    // KAFKA DISABLED: kafkaProducer temporarily removed. Uncomment to re-enable Kafka publishing.
    // @Autowired
    // private KafkaProducerService kafkaProducer;

    // NOTIFICATION FIX: KafkaConsumerService used to be the only place that turned a
    // TaskEvent into a saved Notification row. With Kafka disabled that consumer never
    // runs, so notification creation is now delegated directly to NotificationService instead.
    @Autowired
    private NotificationService notificationService;

    public TaskService(TaskRepository taskRepository, SprintRepository sprintRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
    }

    public Task createTask(TaskRequest request) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setPoints(request.getPoints());
        task.setStatus(request.getStatus());
        task.setAssigneeId(request.getAssigneeId());
        task.setDescription(request.getDescription());

        // CHANGED: sprintId is optional now. No sprint -> the task is created straight into the backlog.
        if (request.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(request.getSprintId())
                    .orElseThrow(() -> new RuntimeException("Sprint not found"));
            task.setSprint(sprint);

            if (sprint.getProject() == null) {
                throw new RuntimeException("Sprint " + sprint.getId() + " has no project set");
            }
            // FIXED: Set the actual Project entity from the sprint
            task.setProject(sprint.getProject());

        } else {
            if (request.getProjectId() == null) {
                throw new RuntimeException("projectId is required when creating a task without a sprint");
            }
            // FIXED: Fetch the Project entity from the database and set it
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            task.setProject(project);
        }

        if (request.getComments() != null) {
            task.setComments(request.getComments());
        }

        Task savedTask = taskRepository.save(task);

        // KAFKA DISABLED: task-assigned event publishing temporarily removed.
        // if (savedTask.getAssigneeId() != null) {
        //     TaskEvent event = new TaskEvent(
        //             savedTask.getId().toString(),
        //             "TASK_ASSIGNED",
        //             "You were assigned to a new task: " + savedTask.getTitle()
        //     );
        //     kafkaProducer.publishTaskEvent(event);
        // }

        // NOTIFICATION FIX: direct replacement for the block above.
        if (savedTask.getAssigneeId() != null) {
            notificationService.createNotification(savedTask, "TASK_ASSIGNED", "You were assigned to a new task: " + savedTask.getTitle());
        }

        return savedTask;
    }

    // NEW: real backlog — tasks for a project that have no sprint assigned yet.
    public List<Task> getBacklogTasks(Long projectId) {
        return taskRepository.findByProjectIdAndSprintIsNull(projectId);
    }

    // NEW: moves a backlog task into a sprint — this is what "Add to sprint" now actually does.
    public Task scheduleTaskIntoSprint(Long taskId, Long sprintId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));

        task.setSprint(sprint);
        Task updatedTask = taskRepository.save(task);

        // KAFKA DISABLED: task-scheduled event publishing temporarily removed.
        // TaskEvent event = new TaskEvent(
        //         updatedTask.getId().toString(),
        //         "TASK_SCHEDULED",
        //         "Task " + updatedTask.getTitle() + " was added to sprint " + sprint.getName()
        // );
        // kafkaProducer.publishTaskEvent(event);

        // NOTIFICATION FIX: direct replacement for the block above.
        notificationService.createNotification(updatedTask, "TASK_SCHEDULED", "Task " + updatedTask.getTitle() + " was added to sprint " + sprint.getName());

        return updatedTask;
    }

    // NEW: persists description edits made in TaskDetailModal.
    public Task updateDescription(Long taskId, String description) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setDescription(description);
        return taskRepository.save(task);
    }

    public Task updateTaskStatus(Long taskId, String newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatus(newStatus);

        if ("DONE".equalsIgnoreCase(newStatus) || "COMPLETED".equalsIgnoreCase(newStatus)) {
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setCompletedAt(null);
        }

        Task updatedTask = taskRepository.save(task);

        // KAFKA DISABLED: task-status-updated event publishing temporarily removed.
        // TaskEvent event = new TaskEvent(updatedTask.getId().toString(), "TASK_STATUS_UPDATED", "Task " + updatedTask.getTitle() + " is now " + newStatus);
        // kafkaProducer.publishTaskEvent(event);

        // NOTIFICATION FIX: direct replacement for the block above.
        notificationService.createNotification(updatedTask, "TASK_STATUS_UPDATED", "Task " + updatedTask.getTitle() + " is now " + newStatus);

        return updatedTask;
    }

    public Task addComments(Long taskId, String comment) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.getComments().add(comment);

        Task updatedTask = taskRepository.save(task);

        // KAFKA DISABLED: task-comment-added event publishing temporarily removed.
        // TaskEvent event = new TaskEvent(updatedTask.getId().toString(), "TASK_COMMENT_ADDED", "New comment added to Task: " + updatedTask.getTitle());
        // kafkaProducer.publishTaskEvent(event);

        // NOTIFICATION FIX: direct replacement for the block above.
        notificationService.createNotification(updatedTask, "TASK_COMMENT_ADDED", "New comment added to Task: " + updatedTask.getTitle());

        return updatedTask;
    }

    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    public Task toggleBlockStatus(Long taskId, Boolean isBlocked) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setIsBlocked(isBlocked);
        return taskRepository.save(task);
    }

    public Task assignUserToTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setAssigneeId(userId);
        Task savedTask = taskRepository.save(task);

        // KAFKA DISABLED: task-assigned event publishing temporarily removed.
        // TaskEvent event = new TaskEvent(
        //         savedTask.getId().toString(),
        //         "TASK_ASSIGNED",
        //         "You were assigned to task: " + savedTask.getTitle()
        // );
        // kafkaProducer.publishTaskEvent(event);

        // NOTIFICATION FIX: direct replacement for the block above.
        notificationService.createNotification(savedTask, "TASK_ASSIGNED", "You were assigned to task: " + savedTask.getTitle());

        return savedTask;
    }

    public List<Task> getTasksForSprint(Long sprintId) {
        return taskRepository.findBySprintId(sprintId);
    }
}