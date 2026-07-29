// PipelineService.java — [M3][Jashanpreet]
package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.*;
import com.nexus.NeuroForge.models.*;
import com.nexus.NeuroForge.models.interfaces.DeploymentEnvironment;
import com.nexus.NeuroForge.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PipelineService {

    @Autowired private PipelineRepository pipelineRepository;
    @Autowired private DeploymentRepository deploymentRepository;
    @Autowired private ProjectRepository projectRepository; // assumes this exists already

    // Called by the webhook when GitHub Actions finishes a build
    public Pipeline recordBuildResult(PipelineWebhookRequest req) {
        Project project = projectRepository.findById(req.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("No project found with id " + req.getProjectId()));
        Pipeline pipeline = new Pipeline();
        pipeline.setStatus(req.getStatus());
        pipeline.setDuration(req.getDuration());
        pipeline.setCommitHash(req.getCommitHash());
        pipeline.setBranch(req.getBranch());
        pipeline.setStartedAt(LocalDateTime.now().minusSeconds(req.getDuration()));
        pipeline.setFinishedAt(LocalDateTime.now());

        projectRepository.findById(req.getProjectId()).ifPresent(pipeline::setProject);

        Deployment deployment = new Deployment();
        deployment.setEnvironment(DeploymentEnvironment.valueOf(req.getEnvironment()));
        deployment.setSuccess(req.isDeploymentSuccess());
        deployment.setDeployedAt(LocalDateTime.now());
        deployment.setPipeline(pipeline);

        pipeline.getDeployments().add(deployment);

        return pipelineRepository.save(pipeline); // cascades to Deployment
    }

    public List<PipelineResponse> getHistory() {
        return pipelineRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PipelineKpiDTO getKpis() {
        List<Pipeline> all = pipelineRepository.findAll();
        long total = all.size();
        long successCount = all.stream()
                .filter(p -> p.getStatus().name().equals("SUCCESS"))
                .count();
        double successRate = total == 0 ? 0 : (successCount * 100.0) / total;
        double avgDuration = all.stream().mapToInt(Pipeline::getDuration).average().orElse(0) / 60.0;
        long today = all.stream()
                .filter(p -> p.getFinishedAt() != null && p.getFinishedAt().toLocalDate().equals(LocalDate.now()))
                .count();
        return new PipelineKpiDTO(total, successRate, avgDuration, today);
    }

    private PipelineResponse toResponse(Pipeline p) {
        Deployment d = p.getDeployments().isEmpty() ? null : p.getDeployments().get(p.getDeployments().size() - 1);
        return new PipelineResponse(
                p.getId(), p.getStatus().name(), p.getDuration(), p.getCommitHash(), p.getBranch(),
                p.getStartedAt(), p.getFinishedAt(),
                d != null ? d.getEnvironment().name() : null,
                d != null && d.isSuccess()
        );
    }
}