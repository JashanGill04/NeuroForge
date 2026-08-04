package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findBySprintId(Long sprintId);
    List<Task> findBySprintProjectId(Long projectId);

    // NEW: backlog tasks have sprint == null, so they can't be found via
    // findBySprintProjectId (that navigates Task -> sprint -> project, which is
    // null for an unscheduled task). This uses Task.projectId directly instead.
    List<Task> findByProjectIdAndSprintIsNull(Long projectId);

}