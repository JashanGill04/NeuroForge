package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.SprintProgressDTO;
import com.nexus.NeuroForge.models.Task;
import com.nexus.NeuroForge.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class SprintProgressService {

    @Autowired
    private TaskRepository taskRepository;

    public SprintProgressDTO getSprintProgress(Long sprintId) {
        List<Task> tasks = taskRepository.findBySprintId(sprintId);

        int totalTasks = tasks.size();
        int completedTasks = 0;
        int blockedTasks = 0;
        int totalPoints = 0;
        int completedPoints = 0;

        // Step 1: Map to track points completed on each specific date
        Map<LocalDate, Integer> dailyCompleted = new TreeMap<>();

        for (Task task : tasks) {
            totalPoints += task.getPoints();

            if (Boolean.TRUE.equals(task.getIsBlocked())) {
                blockedTasks++;
            }

            if ("DONE".equalsIgnoreCase(task.getStatus()) || "COMPLETED".equalsIgnoreCase(task.getStatus())) {
                completedTasks++;
                completedPoints += task.getPoints();

                // Group the completed points by their completion date
                if (task.getCompletedAt() != null) {
                    LocalDate completedDate = task.getCompletedAt().toLocalDate();
                    dailyCompleted.put(completedDate, dailyCompleted.getOrDefault(completedDate, 0) + task.getPoints());
                }
            }
        }

        double progressPercentage = totalPoints == 0 ? 0 : ((double) completedPoints / totalPoints) * 100;

        // Step 2: Convert completions into a Burndown timeline (Date -> Remaining Points)
        Map<String, Integer> burndownData = new TreeMap<>();
        int currentRemaining = totalPoints;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Loop chronologically through the days tasks were completed
        for (Map.Entry<LocalDate, Integer> entry : dailyCompleted.entrySet()) {
            currentRemaining -= entry.getValue(); // Subtract points finished that day
            burndownData.put(entry.getKey().format(formatter), currentRemaining);
        }

        SprintProgressDTO dto = new SprintProgressDTO();
        dto.setTotalTasks(totalTasks);
        dto.setCompletedTasks(completedTasks);
        dto.setBlockedTasks(blockedTasks);
        dto.setTotalPoints(totalPoints);
        dto.setCompletedPoints(completedPoints);
        dto.setProgressPercentage(progressPercentage);

        // Set the burndown map on the DTO
        dto.setBurndownData(burndownData);

        return dto;
    }
}