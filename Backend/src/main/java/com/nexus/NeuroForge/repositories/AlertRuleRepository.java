package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.AlertRule;
import com.nexus.NeuroForge.models.interfaces.AlertMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRuleRepository extends JpaRepository<AlertRule, Long> {
    List<AlertRule> findByProjectId(Long projectId);
    List<AlertRule> findByProjectIdAndEnabledTrue(Long projectId);
}