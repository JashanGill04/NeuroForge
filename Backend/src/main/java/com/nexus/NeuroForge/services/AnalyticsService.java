package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.AnalyticsOverviewDTO;
import com.nexus.NeuroForge.models.Sprint;
import com.nexus.NeuroForge.models.Task;
import com.nexus.NeuroForge.repositories.SprintRepository;
import com.nexus.NeuroForge.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TaskRepository taskRepository;

    public AnalyticsOverviewDTO getProjectAnalytics(Long projectId) {
        List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
        List<Task> allProjectTasks = taskRepository.findBySprintId(projectId);

        int totalSprints = sprints.size();
        int projectTotalTasks = allProjectTasks.size();
        int projectCompletedTasks = 0;

        for (Task task : allProjectTasks) {
            if ("DONE".equalsIgnoreCase(task.getStatus()) || "COMPLETED".equalsIgnoreCase(task.getStatus())) {
                projectCompletedTasks++;
            }
        }

        double overallCompletion = projectTotalTasks == 0 ? 0 : ((double) projectCompletedTasks / projectTotalTasks) * 100;

        AnalyticsOverviewDTO dto = new AnalyticsOverviewDTO();
        dto.setTotalSprints(totalSprints);
        dto.setProjectTotalTasks(projectTotalTasks);
        dto.setProjectCompletedTasks(projectCompletedTasks);
        dto.setOverallProjectCompletion(overallCompletion);

        return dto;
    }
}