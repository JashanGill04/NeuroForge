import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  CircleDashed,
  Loader2,
  X,
  RotateCcw,
  Rocket,
  Globe,
  Tag,
  Layers,
  Cpu,
  HeartPulse,
  GitBranch,
  Calendar,
  Plus,
  RefreshCw,
} from "lucide-react";
import { releaseService } from "../../services/releaseService";
import { Alert, EmptyState } from "../../components/ui";

const ENV_LABEL = {
  DEVELOPMENT: "Development",
  TESTING: "Testing",
  STAGING: "Staging",
  PRODUCTION: "Production",
};

// Same reasoning as PipelineDashboard: backend timestamps have no reliable
// timezone info, so force everything through IST explicitly.
function formatIST(dateStr) {
  if (!dateStr) return null;
  const hasTzInfo = /Z$|[+-]\d{2}:\d{2}$/.test(dateStr);
  const iso = hasTzInfo ? dateStr : `${dateStr}Z`;
  const parsed = new Date(iso);
  if (isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const STATUS_BADGE = {
  DEPLOYED: { cls: "badge-success", Icon: CheckCircle2, label: "Live" },
  SUPERSEDED: { cls: "badge-todo", Icon: CircleDashed, label: "Standby" },
  ROLLED_BACK: { cls: "badge-blocked", Icon: XCircle, label: "Rolled back" },
  ROLLBACK_IN_PROGRESS: { cls: "badge-in_progress", Icon: Loader2, label: "Rolling back..." },
  ROLLBACK_FAILED: { cls: "badge-blocked", Icon: XCircle, label: "Rollback failed" },
  DRAFT: { cls: "badge-in_progress", Icon: Loader2, label: "Draft" },
};

export default function ReleaseDashboard() {
  const [kpis, setKpis] = useState(null);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Minimal "cut a release" form — mainly here so you can drive the demo
  // without curl once a successful deployment exists to release from.
  const [showNewRelease, setShowNewRelease] = useState(false);
  const [newDeploymentId, setNewDeploymentId] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  // silent=true skips the loading spinner — used for background polling so
  // the table doesn't flash empty every few seconds, it just updates in
  // place (slot flips BLUE/GREEN, status moves DEPLOYED -> ROLLED_BACK).
  const loadAll = (silent = false) => {
    if (!silent) setLoading(true);
    return Promise.all([releaseService.getKpis(), releaseService.getHistory()])
      .then(([k, r]) => {
        setKpis(k);
        setReleases(
          [...r].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)),
        );
        setLastUpdated(new Date());
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    loadAll(false);
  }, []);

  // Poll so a release created or rolled back from FlowTester (or the real
  // pipeline) shows up here without a manual refresh. Paused on hidden tabs.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") loadAll(true);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedId) {
      setLoadingDetail(true);
      releaseService
        .getDetail(selectedId)
        .then(setDetail)
        .catch((err) => setError(err.message))
        .finally(() => setLoadingDetail(false));
    } else {
      setDetail(null);
    }
  }, [selectedId]);

  useEffect(() => {
    if (selectedId) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const prevOverflow = document.body.style.overflow;
      const prevPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.paddingRight = prevPaddingRight;
      };
    }
  }, [selectedId]);

  const handleCreateRelease = async () => {
    if (!newDeploymentId) return;
    try {
      await releaseService.createRelease(Number(newDeploymentId), true);
      setShowNewRelease(false);
      setNewDeploymentId("");
      loadAll();
    } catch (err) {
      setError("Failed to create release: " + err.message);
    }
  };

  const handleRollback = async (releaseId) => {
    try {
      await releaseService.rollbackRelease(releaseId);
      alert("Rollback initiated!");
      setSelectedId(null);
      loadAll();
    } catch (err) {
      setError("Failed to rollback: " + err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Release &amp; Monitoring</h1>
          <p className="page-subtitle">
            Blue-green release history, active traffic slots, and rollback control.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {lastUpdated && (
            <span style={{ fontSize: "0.75rem", opacity: 0.6, display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--success)",
                  display: "inline-block",
                }}
              />
              Live &middot; updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button onClick={() => loadAll(false)} className="btn" title="Refresh now">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowNewRelease((s) => !s)}
            className="btn btn-primary"
          >
            <Plus size={16} /> New release
          </button>
        </div>
      </div>

      {error && <Alert onClose={() => setError("")}>{error}</Alert>}

      {showNewRelease && (
        <div className="panel" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="number"
            placeholder="Deployment ID"
            value={newDeploymentId}
            onChange={(e) => setNewDeploymentId(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border)" }}
          />
          <button onClick={handleCreateRelease} className="btn btn-primary">
            <Rocket size={14} /> Cut release
          </button>
        </div>
      )}

      {loading || !kpis ? (
        <EmptyState title="Loading release data…" />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Uptime</div>
              <div className="stat-value stat-value-success">
                {kpis.uptimePercent.toFixed(2)}%
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">MTTR</div>
              <div className="stat-value">
                {kpis.mttrMinutes.toFixed(1)}
                <span className="stat-value-unit">min</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Releases this month</div>
              <div className="stat-value">{kpis.releasesThisMonth}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Rolled back (total)</div>
              <div className="stat-value">{kpis.rolledBackReleases}</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Release history</h2>
            </div>
            {releases.length === 0 ? (
              <EmptyState title="No releases yet" />
            ) : (
              <table className="table" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Version</th>
                    <th>Environment</th>
                    <th>Slot</th>
                    <th>Released</th>
                  </tr>
                </thead>
                <tbody>
                  {releases.map((r) => {
                    const badge = STATUS_BADGE[r.status] || STATUS_BADGE.DRAFT;
                    return (
                      <tr key={r.id} onClick={() => setSelectedId(r.id)} style={{ cursor: "pointer" }}>
                        <td style={{ verticalAlign: "middle" }}>
                          <span className={`badge ${badge.cls}`}>
                            <badge.Icon size={12} /> {badge.label}
                          </span>
                        </td>
                        <td style={{ verticalAlign: "middle" }}>{r.version || "—"}</td>
                        <td style={{ verticalAlign: "middle" }}>
                          {ENV_LABEL[r.environment] || r.environment || "—"}
                        </td>
                        <td style={{ verticalAlign: "middle" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Layers size={12} /> {r.slot || "—"}
                          </span>
                        </td>
                        <td style={{ verticalAlign: "middle" }}>{formatIST(r.releaseDate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Detail modal */}
      {selectedId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="panel bd-modal"
            style={{
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              margin: 0,
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              padding: 0,
            }}
          >
            <div className="bd-header">
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h2 className="bd-title">Release #{selectedId}</h2>
                <div className="bd-subtitle">
                  <Globe size={13} /> {ENV_LABEL[detail?.environment] || detail?.environment || "—"}
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="bd-close">
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: "24px",
                overflowY: "auto",
                scrollbarGutter: "stable",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {loadingDetail || !detail ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Loader2 size={32} style={{ margin: "0 auto 16px auto", opacity: 0.5 }} />
                  <p>Fetching release data...</p>
                </div>
              ) : (
                <>
                  <div className="bd-overview-grid">
                    <div className="bd-overview-card">
                      <div className="bd-overview-top">
                        <span className="bd-overview-label">Version</span>
                        <Tag size={15} className="bd-overview-icon" />
                      </div>
                      <div className="bd-overview-value">{detail.version || "—"}</div>
                    </div>
                    <div className="bd-overview-card">
                      <div className="bd-overview-top">
                        <span className="bd-overview-label">Slot</span>
                        <Layers size={15} className="bd-overview-icon" />
                      </div>
                      <div className="bd-overview-value">{detail.slot || "—"}</div>
                    </div>
                    <div className="bd-overview-card">
                      <div className="bd-overview-top">
                        <span className="bd-overview-label">Released</span>
                        <Calendar size={15} className="bd-overview-icon" />
                      </div>
                      <div className="bd-overview-value">{formatIST(detail.releaseDate) || "—"}</div>
                    </div>
                  </div>

                  {detail.pipeline && (
                    <div>
                      <h3 className="bd-section-title">
                        <GitBranch size={14} /> Source build
                      </h3>
                      <div className="panel bd-deploy-panel">
                        <div className="bd-deploy-row">
                          <span className="bd-deploy-label">Branch</span>
                          <span>{detail.pipeline.branch}</span>
                        </div>
                        <div className="bd-deploy-row">
                          <span className="bd-deploy-label">Commit</span>
                          <span className="bd-deploy-mono">
                            {detail.pipeline.commitHash?.substring(0, 7) || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {detail.deployment && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <h3 className="bd-section-title" style={{ margin: 0 }}>
                          <HeartPulse size={14} /> Deployment health
                        </h3>
                        {detail.active && (
                          <button
                            onClick={() => handleRollback(detail.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 12px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              borderRadius: "8px",
                              border: "1px solid var(--danger)",
                              background: "var(--danger-soft)",
                              color: "var(--danger)",
                              cursor: "pointer",
                            }}
                          >
                            <RotateCcw size={13} /> Rollback
                          </button>
                        )}
                      </div>

                      <div className="panel bd-deploy-panel">
                        <div className="bd-deploy-row">
                          <span className="bd-deploy-label">
                            <Tag size={14} /> Image tag
                          </span>
                          <span className="bd-deploy-mono">{detail.deployment.imageTag}</span>
                        </div>
                        <div className="bd-deploy-row">
                          <span className="bd-deploy-label">
                            <HeartPulse size={14} /> Pods
                          </span>
                          <span className="badge badge-success">
                            {detail.deployment.podsRunning} / {detail.deployment.podsTotal} running
                          </span>
                        </div>
                        <div className="bd-deploy-row bd-deploy-row-stacked">
                          <span className="bd-deploy-label">
                            <Cpu size={14} /> Resource load
                          </span>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "160px" }}>
                            <div className="bd-resource-line">
                              <span>CPU</span>
                              <span>{detail.deployment.cpuPercent}%</span>
                            </div>
                            <div className="bd-resource-track">
                              <div
                                className="bd-resource-fill"
                                style={{ width: `${Math.min(detail.deployment.cpuPercent, 100)}%` }}
                              />
                            </div>
                            <div className="bd-resource-line">
                              <span>Mem</span>
                              <span>{detail.deployment.memoryPercent}%</span>
                            </div>
                            <div className="bd-resource-track">
                              <div
                                className="bd-resource-fill"
                                style={{ width: `${Math.min(detail.deployment.memoryPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}