package com.nexus.NeuroForge.config;

import com.nexus.NeuroForge.services.ReleaseService;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class ObservabilityConfig {

    @Autowired private MeterRegistry meterRegistry;
    @Autowired private ReleaseService releaseService;

    @PostConstruct
    public void registerGauges() {
        Gauge.builder("neuroforge_release_uptime_percent", releaseService,
                        s -> s.getPlatformKpis().uptimePercent)
                .description("Simulated uptime percentage derived from release/rollback history, across all projects")
                .register(meterRegistry);

        Gauge.builder("neuroforge_release_mttr_minutes", releaseService,
                        s -> s.getPlatformKpis().mttrMinutes)
                .description("Mean time to recovery in minutes across rolled-back releases, across all projects")
                .register(meterRegistry);

        Gauge.builder("neuroforge_releases_this_month", releaseService,
                        s -> s.getPlatformKpis().releasesThisMonth)
                .description("Count of releases cut in the current calendar month, across all projects")
                .register(meterRegistry);

        Gauge.builder("neuroforge_releases_rolled_back_total", releaseService,
                        s -> s.getPlatformKpis().rolledBackReleases)
                .description("Total number of releases that have been rolled back, across all projects")
                .register(meterRegistry);
    }
}