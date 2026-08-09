package com.nexus.NeuroForge.dto;

public class ReleaseKpiDTO {
    public long releasesThisMonth;
    public double uptimePercent;
    public double mttrMinutes;
    public long totalReleases;
    public long rolledBackReleases;

    public ReleaseKpiDTO() {}

    public ReleaseKpiDTO(long releasesThisMonth, double uptimePercent, double mttrMinutes,
                          long totalReleases, long rolledBackReleases) {
        this.releasesThisMonth = releasesThisMonth;
        this.uptimePercent = uptimePercent;
        this.mttrMinutes = mttrMinutes;
        this.totalReleases = totalReleases;
        this.rolledBackReleases = rolledBackReleases;
    }
}
