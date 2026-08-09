// ObservabilityConfig.java — [M4][Jashanpreet]
// Registers business-level KPI gauges (uptime%, MTTR, releases/month) with
// Micrometer so they show up at /actuator/prometheus next to the JVM/system
// metrics Actuator already exposes for free. Neha's Prometheus scrape job
// hits this same endpoint for both.
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
                        s -> s.getKpis().uptimePercent)
                .description("Simulated uptime percentage derived from release/rollback history")
                .register(meterRegistry);

        Gauge.builder("neuroforge_release_mttr_minutes", releaseService,
                        s -> s.getKpis().mttrMinutes)
                .description("Mean time to recovery in minutes across rolled-back releases")
                .register(meterRegistry);

        Gauge.builder("neuroforge_releases_this_month", releaseService,
                        s -> s.getKpis().releasesThisMonth)
                .description("Count of releases cut in the current calendar month")
                .register(meterRegistry);

        Gauge.builder("neuroforge_releases_rolled_back_total", releaseService,
                        s -> s.getKpis().rolledBackReleases)
                .description("Total number of releases that have been rolled back")
                .register(meterRegistry);
    }
}
