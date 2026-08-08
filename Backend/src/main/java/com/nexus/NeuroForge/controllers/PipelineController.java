// PipelineController.java
package com.nexus.NeuroForge.controllers;

import com.nexus.NeuroForge.dto.*;
import com.nexus.NeuroForge.models.Pipeline;
import com.nexus.NeuroForge.services.PipelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pipelines")
public class PipelineController {

    @Autowired private PipelineService pipelineService;

    @PostMapping("/webhook")
    public Pipeline receiveBuildResult(@RequestBody PipelineWebhookRequest request) {
        return pipelineService.recordBuildResult(request);
    }

    @GetMapping
    public List<PipelineResponse> getHistory() {
        return pipelineService.getHistory();
    }

    @GetMapping("/kpi")
    public PipelineKpiDTO getKpis() {
        return pipelineService.getKpis();
    }

    @GetMapping("/{id}")
    public PipelineDetailDTO getDetail(@PathVariable Long id) {
        return pipelineService.getDetail(id);
    }

    // NEW: Endpoint to manually trigger a build
    @PostMapping("/trigger/{projectId}")
    public ResponseEntity<String> triggerPipeline(@PathVariable Long projectId) {
        pipelineService.triggerJenkinsBuild(projectId);
        return ResponseEntity.ok("Pipeline triggered successfully");
    }

    // NEW: Endpoint to rollback a specific deployment
    @PostMapping("/{pipelineId}/rollback")
    public ResponseEntity<String> rollbackDeployment(@PathVariable Long pipelineId) {
        pipelineService.executeRollback(pipelineId);
        return ResponseEntity.ok("Rollback initiated");
    }
}