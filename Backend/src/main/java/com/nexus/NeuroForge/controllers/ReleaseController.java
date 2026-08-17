// ReleaseController.java — [M4][Jashanpreet]
package com.nexus.NeuroForge.controllers;

import com.nexus.NeuroForge.dto.*;
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

    // CHANGED: was `public Release createRelease(...)`. Returning the raw
    // entity meant Jackson had to serialize release.getDeployment(), and
    // Deployment.release (the mappedBy inverse side) points right back —
    // Release -> Deployment -> Release -> ... until it blows the stack.
    // toResponse() flattens it to plain fields, same shape getHistory()
    // already returns, so nothing on the frontend needs to change.
    @PostMapping
    public ReleaseResponse createRelease(@RequestBody CreateReleaseRequest request) {
        return releaseService.toResponse(releaseService.createRelease(request));
    }

    // CHANGED: now requires ?projectId= — history is scoped per project so
    // one project's dashboard never shows another project's releases.
    @GetMapping
    public List<ReleaseResponse> getHistory(@RequestParam Long projectId) {
        return releaseService.getHistory(projectId);
    }

    // CHANGED: same project scoping for KPIs.
    @GetMapping("/kpi")
    public ReleaseKpiDTO getKpis(@RequestParam Long projectId) {
        return releaseService.getKpis(projectId);
    }

    @GetMapping("/{id}")
    public ReleaseDetailDTO getDetail(@PathVariable Long id) {
        return releaseService.getDetail(id);
    }

    // CHANGED: same reasoning — this is what EnvironmentHealthPanel calls
    // for all 4 environments on every page load. Now also scoped by
    // ?projectId= so two projects both deploying to, say, STAGING don't
    // show each other's active release. Returning the raw entity meant it
    // 500'd every time there WAS an active release to show, which your
    // frontend's error handling silently displayed as "No active
    // release" — looking identical to the correct empty state.
    @GetMapping("/active/{environment}")
    public ReleaseResponse getActiveRelease(
            @PathVariable DeploymentEnvironment environment,
            @RequestParam Long projectId) {
        return releaseService.toResponse(releaseService.getActiveRelease(projectId, environment));
    }

    @PostMapping("/{id}/rollback")
    public ResponseEntity<String> rollbackRelease(@PathVariable Long id) {
        releaseService.rollbackRelease(id);
        return ResponseEntity.ok("Rollback initiated");
    }
}