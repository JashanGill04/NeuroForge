// PipelineService.java — [M3][Jashanpreet]
package com.nexus.NeuroForge.services;

import com.nexus.NeuroForge.dto.*;
import com.nexus.NeuroForge.models.*;
import com.nexus.NeuroForge.models.interfaces.DeploymentEnvironment;
import com.nexus.NeuroForge.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.nexus.NeuroForge.models.interfaces.TestResult;
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
        pipeline.setCommitMessage(req.getCommitMessage());
        pipeline.setBranch(req.getBranch());
        pipeline.setTriggerSource(req.getTriggerSource());
        pipeline.setStartedAt(LocalDateTime.now().minusSeconds(req.getDuration()));
        pipeline.setFinishedAt(LocalDateTime.now());
        pipeline.setProject(project);

        if (req.getStages() != null) {
            int order = 0;
            for (var s : req.getStages()) {
                PipelineStage stage = new PipelineStage();
                stage.setName(s.name);
                stage.setStatus(s.status);
                stage.setDurationSeconds(s.durationSeconds);
                stage.setSequenceOrder(order++);
                stage.setPipeline(pipeline);
                pipeline.getStages().add(stage);
            }
        }

   if (req.getTestSummary() != null) {
    var ts = req.getTestSummary();
    for (int i = 0; i < ts.passed; i++) {
        TestCase tc = new TestCase();
        tc.setResult(TestResult.PASSED);
        tc.setCoverage(ts.coveragePercent);
        tc.setPipeline(pipeline);
        pipeline.getTestCases().add(tc);
    }
    for (int i = 0; i < ts.failed; i++) {
        TestCase tc = new TestCase();
        tc.setResult(TestResult.FAILED);
        tc.setCoverage(ts.coveragePercent);
        tc.setPipeline(pipeline);
        pipeline.getTestCases().add(tc);
    }
    for (int i = 0; i < ts.skipped; i++) {
        TestCase tc = new TestCase();
        tc.setResult(TestResult.SKIPPED);
        tc.setCoverage(ts.coveragePercent);
        tc.setPipeline(pipeline);
        pipeline.getTestCases().add(tc);
    }
}

        Deployment deployment = new Deployment();
        deployment.setEnvironment(DeploymentEnvironment.valueOf(req.getEnvironment()));
        deployment.setSuccess(req.isDeploymentSuccess());
        deployment.setDeployedAt(LocalDateTime.now());
        deployment.setPipeline(pipeline);

        if (req.getDeploymentInfo() != null) {
            var di = req.getDeploymentInfo();
            deployment.setImageTag(di.imageTag);
            deployment.setPodsRunning(di.podsRunning);
            deployment.setPodsTotal(di.podsTotal);
            deployment.setCpuPercent(di.cpuPercent);
            deployment.setMemoryPercent(di.memoryPercent);
        }

        boolean hadPriorSuccess = deploymentRepository
                .existsByPipeline_Project_IdAndEnvironmentAndSuccessTrue(req.getProjectId(),
                        DeploymentEnvironment.valueOf(req.getEnvironment()));
        deployment.setRollbackEligible(hadPriorSuccess);

        pipeline.getDeployments().add(deployment);
        return pipelineRepository.save(pipeline);
    }

    // New — powers the detail view
    public PipelineDetailDTO getDetail(Long id) {
        Pipeline p = pipelineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No pipeline found with id " + id));

        PipelineDetailDTO dto = new PipelineDetailDTO();
        dto.id = p.getId();
        dto.status = p.getStatus().name();
        dto.branch = p.getBranch();
        dto.commitHash = p.getCommitHash();
        dto.commitMessage = p.getCommitMessage();
        dto.triggerSource = p.getTriggerSource() != null ? p.getTriggerSource().name() : null;
        dto.duration = p.getDuration();
        dto.startedAt = p.getStartedAt();
        dto.finishedAt = p.getFinishedAt();

        dto.stages = p.getStages().stream().map(s -> {
            var si = new PipelineDetailDTO.StageInfo();
            si.name = s.getName();
            si.status = s.getStatus().name();
            si.durationSeconds = s.getDurationSeconds();
            return si;
        }).collect(Collectors.toList());

var testInfo = new PipelineDetailDTO.TestInfo();
testInfo.passed = (int) p.getTestCases().stream()
        .filter(t -> t.getResult() == TestResult.PASSED).count();
testInfo.failed = (int) p.getTestCases().stream()
        .filter(t -> t.getResult() == TestResult.FAILED).count();
testInfo.skipped = (int) p.getTestCases().stream()
        .filter(t -> t.getResult() == TestResult.SKIPPED).count();
testInfo.coveragePercent = p.getTestCases().stream()
        .mapToDouble(TestCase::getCoverage).average().orElse(0);
dto.tests = testInfo;

        if (!p.getDeployments().isEmpty()) {
            Deployment d = p.getDeployments().get(p.getDeployments().size() - 1);
            var di = new PipelineDetailDTO.DeployInfo();
            di.environment = d.getEnvironment().name();
            di.success = d.isSuccess();
            di.imageTag = d.getImageTag();
            di.podsRunning = d.getPodsRunning();
            di.podsTotal = d.getPodsTotal();
            di.cpuPercent = d.getCpuPercent();
            di.memoryPercent = d.getMemoryPercent();
            di.rollbackEligible = d.isRollbackEligible();
            dto.deployment = di;
        }

        return dto;
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