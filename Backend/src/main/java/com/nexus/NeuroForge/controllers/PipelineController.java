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
}