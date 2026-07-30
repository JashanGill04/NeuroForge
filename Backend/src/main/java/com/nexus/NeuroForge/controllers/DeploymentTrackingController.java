package com.nexus.NeuroForge.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DeploymentTrackingController {

    @PostMapping("/track-deployment")
    public ResponseEntity<String> trackDeployment(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok("Deployment tracked successfully");
    }
}