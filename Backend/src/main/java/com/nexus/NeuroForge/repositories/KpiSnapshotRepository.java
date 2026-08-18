package com.nexus.NeuroForge.repositories;

import com.nexus.NeuroForge.models.KpiSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface KpiSnapshotRepository extends JpaRepository<KpiSnapshot, Long> {
    List<KpiSnapshot> findByCapturedAtAfterOrderByCapturedAtAsc(LocalDateTime after);
        List<KpiSnapshot> findByProjectIdAndCapturedAtAfterOrderByCapturedAtAsc(Long projectId, LocalDateTime after);

}