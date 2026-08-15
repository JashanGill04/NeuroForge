package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.Alert;
import com.nexus.NeuroForge.models.interfaces.AlertMetric;
import com.nexus.NeuroForge.models.interfaces.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByMetricAndStatus(AlertMetric metric, AlertStatus status);
    List<Alert> findAllByOrderByTriggeredAtDesc();
}