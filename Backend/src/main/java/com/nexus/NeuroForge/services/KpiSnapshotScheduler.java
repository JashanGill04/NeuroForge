package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.PipelineKpiDTO;
import com.nexus.NeuroForge.dto.ReleaseKpiDTO;
import com.nexus.NeuroForge.models.KpiSnapshot;
import com.nexus.NeuroForge.models.Project;
import com.nexus.NeuroForge.repositories.KpiSnapshotRepository;
import com.nexus.NeuroForge.repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class KpiSnapshotScheduler {

    @Autowired private ReleaseService releaseService;
    @Autowired private PipelineService pipelineService;
    @Autowired private KpiSnapshotRepository snapshotRepository;
    @Autowired private ProjectRepository projectRepository;

    @Scheduled(fixedRate = 300000) // every 5 minutes
    public void snapshot() {
        for (Project project : projectRepository.findAll()) {
            snapshotForProject(project.getId());
        }
    }

    private void snapshotForProject(Long projectId) {
        ReleaseKpiDTO r = releaseService.getKpis(projectId);
        PipelineKpiDTO p = pipelineService.getKpis(projectId);

        KpiSnapshot snap = new KpiSnapshot();
        snap.setProjectId(projectId);
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