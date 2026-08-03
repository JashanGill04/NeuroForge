// PipelineController.java — [M3][Jashanpreet]
package com.nexus.NeuroForge.controllers;

import com.nexus.NeuroForge.dto.*;
import com.nexus.NeuroForge.models.Pipeline;
import com.nexus.NeuroForge.services.PipelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pipelines")
public class PipelineController {

    @Autowired private PipelineService pipelineService;

    // Called by GitHub Actions after build/test/deploy step
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
}