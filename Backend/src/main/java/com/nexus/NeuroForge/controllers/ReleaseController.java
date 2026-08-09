// ReleaseController.java — [M4][Jashanpreet]
package com.nexus.NeuroForge.controllers;

import com.nexus.NeuroForge.dto.*;
import com.nexus.NeuroForge.models.Release;
import com.nexus.NeuroForge.models.interfaces.DeploymentEnvironment;
import com.nexus.NeuroForge.services.ReleaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/releases")
public class ReleaseController {

    @Autowired private ReleaseService releaseService;

    @PostMapping
    public Release createRelease(@RequestBody CreateReleaseRequest request) {
        return releaseService.createRelease(request);
    }

    @GetMapping
    public List<ReleaseResponse> getHistory() {
        return releaseService.getHistory();
    }

    @GetMapping("/kpi")
    public ReleaseKpiDTO getKpis() {
        return releaseService.getKpis();
    }

    @GetMapping("/{id}")
    public ReleaseDetailDTO getDetail(@PathVariable Long id) {
        return releaseService.getDetail(id);
    }

    @GetMapping("/active/{environment}")
    public Release getActiveRelease(@PathVariable DeploymentEnvironment environment) {
        return releaseService.getActiveRelease(environment);
    }

    @PostMapping("/{id}/rollback")
    public ResponseEntity<String> rollbackRelease(@PathVariable Long id) {
        releaseService.rollbackRelease(id);
        return ResponseEntity.ok("Rollback initiated");
    }
}
