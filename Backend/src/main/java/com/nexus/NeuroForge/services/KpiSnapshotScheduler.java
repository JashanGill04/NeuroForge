package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.PipelineKpiDTO;
import com.nexus.NeuroForge.dto.ReleaseKpiDTO;
import com.nexus.NeuroForge.models.KpiSnapshot;
import com.nexus.NeuroForge.repositories.KpiSnapshotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class KpiSnapshotScheduler {

    @Autowired private ReleaseService releaseService;
    @Autowired private PipelineService pipelineService;
    @Autowired private KpiSnapshotRepository snapshotRepository;

    @Scheduled(fixedRate = 300000) // every 5 minutes
    public void snapshot() {
        ReleaseKpiDTO r = releaseService.getKpis();
        PipelineKpiDTO p = pipelineService.getKpis();

        KpiSnapshot snap = new KpiSnapshot();
        snap.setCapturedAt(LocalDateTime.now());
        snap.setUptimePercent(r.uptimePercent);
        snap.setMttrMinutes(r.mttrMinutes);
        snap.setReleasesThisMonth(r.releasesThisMonth);
        snap.setRolledBackReleases(r.rolledBackReleases);
        snap.setPipelineSuccessRate(p.getSuccessRate());
        snap.setAvgDeployMinutes(p.getAvgDeployTimeMinutes());
        snapshotRepository.save(snap);
    }
}