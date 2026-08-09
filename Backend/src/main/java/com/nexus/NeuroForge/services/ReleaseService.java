// ReleaseService.java — [M4][Jashanpreet]
package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.*;
import com.nexus.NeuroForge.models.Deployment;
import com.nexus.NeuroForge.models.Release;
import com.nexus.NeuroForge.models.interfaces.DeploymentEnvironment;
import com.nexus.NeuroForge.models.interfaces.DeploymentSlot;
import com.nexus.NeuroForge.models.interfaces.ReleaseStatus;
import com.nexus.NeuroForge.repositories.DeploymentRepository;
import com.nexus.NeuroForge.repositories.ReleaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReleaseService {

    @Autowired private ReleaseRepository releaseRepository;
    @Autowired private DeploymentRepository deploymentRepository;

    // PipelineService already owns the GitHub Actions dispatch + rollback-eligibility
    // logic from M3 (executeRollback). ReleaseService reuses it rather than
    // re-implementing the workflow trigger, and layers the release-record
    // bookkeeping (blue-green slot swap, status transitions) on top.
    @Autowired private PipelineService pipelineService;

    /**
     * Cuts a new Release from a successful Deployment and promotes it to
     * live traffic in its environment (the "green" side goes live, the
     * previously active release becomes the standby "blue" side, or vice
     * versa).
     */
    public Release createRelease(CreateReleaseRequest req) {
        Deployment deployment = deploymentRepository.findById(req.getDeploymentId())
                .orElseThrow(() -> new IllegalArgumentException("No deployment found with id " + req.getDeploymentId()));

        if (!deployment.isSuccess()) {
            throw new IllegalStateException("Cannot cut a release from a deployment that did not succeed.");
        }

        if (releaseRepository.findByDeployment_Id(deployment.getId()).isPresent()) {
            throw new IllegalStateException("A release already exists for this deployment.");
        }

        DeploymentEnvironment env = deployment.getEnvironment();
        Optional<Release> currentlyActive = releaseRepository
                .findTopByEnvironmentAndActiveTrueOrderByReleaseDateDesc(env);

        Release release = new Release();
        release.setDeployment(deployment);
        release.setVersion(deployment.getImageTag() != null ? deployment.getImageTag() : "deploy-" + deployment.getId());
        release.setApproved(req.isApproved());
        release.setReleaseDate(LocalDateTime.now());
        release.setEnvironment(env);
        release.setStatus(ReleaseStatus.DEPLOYED);
        release.setActive(true);
        release.setSlot(currentlyActive
                .map(r -> r.getSlot() == DeploymentSlot.BLUE ? DeploymentSlot.GREEN : DeploymentSlot.BLUE)
                .orElse(DeploymentSlot.BLUE));

        releaseRepository.save(release);

        // Blue-green swap: the old active release stands down but stays in
        // history (not rolled back) so it can be reactivated instantly if
        // this new one needs to be rolled back later.
        currentlyActive.ifPresent(prev -> {
            prev.setActive(false);
            prev.setStatus(ReleaseStatus.SUPERSEDED);
            releaseRepository.save(prev);
        });

        return release;
    }

    /**
     * Rolls back the currently active release in its environment: triggers
     * the actual GitHub Actions rollback workflow via PipelineService (same
     * mechanism M3 already validates), then flips the blue-green slots back
     * so the previous release becomes active again.
     */
    public void rollbackRelease(Long releaseId) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new IllegalArgumentException("No release found with id " + releaseId));

        if (!release.isActive()) {
            throw new IllegalStateException("Only the currently active release can be rolled back.");
        }

        Long pipelineId = release.getDeployment().getPipeline().getId();
        pipelineService.executeRollback(pipelineId); // dispatches the real rollback workflow

        release.setActive(false);
        release.setStatus(ReleaseStatus.ROLLED_BACK);
        releaseRepository.save(release);

        // Reactivate the most recently superseded release in the same
        // environment — that's the image the rollback workflow just
        // redeployed.
        releaseRepository.findByEnvironmentOrderByReleaseDateDesc(release.getEnvironment()).stream()
                .filter(r -> r.getStatus() == ReleaseStatus.SUPERSEDED)
                .findFirst()
                .ifPresent(prev -> {
                    prev.setActive(true);
                    prev.setStatus(ReleaseStatus.DEPLOYED);
                    releaseRepository.save(prev);
                });
    }

    public Release getActiveRelease(DeploymentEnvironment environment) {
        return releaseRepository.findTopByEnvironmentAndActiveTrueOrderByReleaseDateDesc(environment)
                .orElseThrow(() -> new IllegalStateException("No active release for environment " + environment));
    }

    public List<ReleaseResponse> getHistory() {
        return releaseRepository.findAllByOrderByReleaseDateDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ReleaseDetailDTO getDetail(Long id) {
        Release r = releaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No release found with id " + id));

        ReleaseDetailDTO dto = new ReleaseDetailDTO();
        dto.id = r.getId();
        dto.version = r.getVersion();
        dto.environment = r.getEnvironment() != null ? r.getEnvironment().name() : null;
        dto.status = r.getStatus() != null ? r.getStatus().name() : null;
        dto.slot = r.getSlot() != null ? r.getSlot().name() : null;
        dto.active = r.isActive();
        dto.approved = r.isApproved();
        dto.releaseDate = r.getReleaseDate();

        Deployment d = r.getDeployment();
        if (d != null) {
            var di = new ReleaseDetailDTO.DeploymentInfo();
            di.id = d.getId();
            di.imageTag = d.getImageTag();
            di.podsRunning = d.getPodsRunning();
            di.podsTotal = d.getPodsTotal();
            di.cpuPercent = d.getCpuPercent();
            di.memoryPercent = d.getMemoryPercent();
            di.success = d.isSuccess();
            dto.deployment = di;

            if (d.getPipeline() != null) {
                var pi = new ReleaseDetailDTO.PipelineInfo();
                pi.id = d.getPipeline().getId();
                pi.branch = d.getPipeline().getBranch();
                pi.commitHash = d.getPipeline().getCommitHash();
                pi.commitMessage = d.getPipeline().getCommitMessage();
                dto.pipeline = pi;
            }
        }

        return dto;
    }

    /**
     * KPI Simulation (per Milestone 4 spec): uptime% and MTTR are derived
     * from release/rollback history rather than a live monitoring feed,
     * since that lives in Neha's Prometheus/Grafana stack. These numbers
     * are exposed as real gauges (see ObservabilityConfig) so Prometheus
     * can scrape and Grafana can chart them like any other metric, and are
     * swappable for live-monitoring-derived values later without changing
     * the API contract.
     */
    public ReleaseKpiDTO getKpis() {
        List<Release> all = releaseRepository.findAllByOrderByReleaseDateDesc();
        long total = all.size();

        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        long releasesThisMonth = releaseRepository.countByReleaseDateBetween(monthStart, LocalDateTime.now());

        List<Release> rolledBack = all.stream()
                .filter(r -> r.getStatus() == ReleaseStatus.ROLLED_BACK)
                .collect(Collectors.toList());
        long rolledBackCount = rolledBack.size();

        double mttrMinutes = rolledBack.stream()
                .mapToDouble(this::minutesToRecovery)
                .filter(m -> m >= 0)
                .average()
                .orElse(0);

        double incidentRate = total == 0 ? 0 : (double) rolledBackCount / total;
        double uptimePercent = Math.max(0, 100.0 - (incidentRate * 5.0));

        return new ReleaseKpiDTO(releasesThisMonth, round(uptimePercent), round(mttrMinutes), total, rolledBackCount);
    }

    // Time between a rolled-back release going live and the replacement
    // release (the one that superseded it, redeployed after rollback)
    // going live — i.e. how long the bad release was serving traffic.
    private double minutesToRecovery(Release rolledBackRelease) {
        return releaseRepository.findByEnvironmentOrderByReleaseDateDesc(rolledBackRelease.getEnvironment()).stream()
                .filter(r -> r.getReleaseDate().isAfter(rolledBackRelease.getReleaseDate()))
                .min(Comparator.comparing(Release::getReleaseDate))
                .map(next -> (double) Duration.between(rolledBackRelease.getReleaseDate(), next.getReleaseDate()).toMinutes())
                .orElse(-1.0);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private ReleaseResponse toResponse(Release r) {
        Deployment d = r.getDeployment();
        return new ReleaseResponse(
                r.getId(), r.getVersion(),
                r.getEnvironment() != null ? r.getEnvironment().name() : null,
                r.getStatus() != null ? r.getStatus().name() : null,
                r.getSlot() != null ? r.getSlot().name() : null,
                r.isActive(), r.isApproved(), r.getReleaseDate(),
                d != null ? d.getId() : null,
                d != null && d.getPipeline() != null ? d.getPipeline().getId() : null
        );
    }
}
