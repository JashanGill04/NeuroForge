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

    // Called by Jenkins' "Track Deployment" stage once the container is up.
    // NOTE: this must be in the SecurityConfig permitAll list — Jenkins has no
    // Keycloak token to send.
    //
    // Returns a PipelineResponse DTO rather than the raw Pipeline entity: Pipeline
    // has a List<Deployment>, and each Deployment holds a back-reference to its
    // parent Pipeline. Serializing the entity directly walks that cycle
    // (pipeline -> deployments -> pipeline -> deployments -> ...) until Jackson
    // hits its nesting limit and 500s. The DTO has no back-reference, so it's safe.
    @PostMapping("/webhook")
    public PipelineResponse receiveBuildResult(@RequestBody PipelineWebhookRequest request) {
        Pipeline saved = pipelineService.recordBuildResult(request);
        System.out.println("Build result received for pipeline: " + saved.getId());
        return pipelineService.toResponse(saved);
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