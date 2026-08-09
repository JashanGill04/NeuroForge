import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  GitCommitHorizontal,
  Clock,
  Loader2,
  CircleDashed,
  X,
  Box,
  TestTube2,
  Activity,
  Settings,
  GitBranch,
  Calendar,
  User,
  Globe,
  Cpu,
  HeartPulse,
  Tag,
  FolderKanban,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { pipelineService } from "../../services/pipelineService";
import { Alert, EmptyState } from "../../components/ui";

const ENV_LABEL = { DEV: "Dev", STAGING: "Staging", PRODUCTION: "Production" };

// Backend timestamps come back without reliable timezone info (server runs in
// UTC inside Docker). Force everything through IST explicitly so the UI never
// depends on the browser's assumed timezone.
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
  SUCCESS: {
    cls: "badge-success",
    Icon: CheckCircle2,
    label: "Pass",
    dot: "var(--success)",
  },
  FAILED: {
    cls: "badge-blocked",
    Icon: XCircle,
    label: "Fail",
    dot: "var(--danger)",
  },
  RUNNING: {
    cls: "badge-in_progress",
    Icon: Loader2,
    label: "Running",
    dot: "var(--hold)",
  },
  PENDING: {
    cls: "badge-todo",
    Icon: CircleDashed,
    label: "Pending",
    dot: "var(--info)",
  },
};

export default function PipelineDashboard() {
  const [kpis, setKpis] = useState(null);
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [selectedBuildId, setSelectedBuildId] = useState(null);
  const [buildDetails, setBuildDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([pipelineService.getKpis(), pipelineService.getHistory()])
      .then(([k, b]) => {
        setKpis(k);
        setBuilds(
          [...b].sort((a, c) => new Date(c.startedAt) - new Date(a.startedAt)),
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedBuildId) {
      setLoadingDetails(true);
      pipelineService
        .getDetail(selectedBuildId)
        .then(setBuildDetails)
        .catch((err) => setError(err.message))
        .finally(() => setLoadingDetails(false));
    } else {
      setBuildDetails(null);
    }
  }, [selectedBuildId]);

  // Lock background scroll while the modal is open so the page behind it
  // can't shift/scroll and cause the flicker when the scrollbar appears.
  useEffect(() => {
    if (selectedBuildId) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      const prevOverflow = document.body.style.overflow;
      const prevPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.paddingRight = prevPaddingRight;
      };
    }
  }, [selectedBuildId]);

  // Add these functions inside your PipelineDashboard component
  const handleTriggerBuild = async () => {
    try {
      // Hardcoding projectId 1 for now based on your Jenkinsfile env.PROJECT_ID
      await pipelineService.triggerBuild(1);
      alert("Build triggered successfully!");
      // Refresh history
      const newBuilds = await pipelineService.getHistory();
      setBuilds(
        [...newBuilds].sort(
          (a, c) => new Date(c.startedAt) - new Date(a.startedAt),
        ),
      );
    } catch (err) {
      setError("Failed to trigger build: " + err.message);
    }
  };

  const handleRollback = async (pipelineId) => {
    try {
      await pipelineService.rollbackBuild(pipelineId);
      alert("Rollback initiated!");
      setSelectedBuildId(null);
    } catch (err) {
      setError("Failed to rollback: " + err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Pipeline &amp; Deployment Dashboard</h1>
          <p className="page-subtitle">
            CI/CD build history and deployment status across all projects.
          </p>
        </div>  
        <button onClick={handleTriggerBuild} className="btn btn-primary">
            <Activity size={16} /> Trigger Build
          </button>
      
      </div>

      {error && <Alert onClose={() => setError("")}>{error}</Alert>}

      {loading || !kpis ? (
        <EmptyState title="Loading pipeline data…" />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Build success rate</div>
              <div className="stat-value stat-value-success">
                {kpis.successRate.toFixed(1)}%
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total builds</div>
              <div className="stat-value">
                {kpis.totalBuilds.toLocaleString()}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg. deploy time</div>
              <div className="stat-value">
                {kpis.avgDeployTimeMinutes.toFixed(1)}
                <span className="stat-value-unit">min</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Builds today</div>
              <div className="stat-value">{kpis.buildsToday}</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Recent builds</h2>
            </div>
            {builds.length === 0 ? (
              <EmptyState title="No builds yet" />
            ) : (
              <table className="table" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Branch</th>
                    <th>Commit</th>
                    <th>Environment</th>
                    <th>Duration</th>
                    <th>Started</th>
                  </tr>
                </thead>
                <tbody>
                  {builds.map((b) => {
                    const badge =
                      STATUS_BADGE[b.status] || STATUS_BADGE.PENDING;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBuildId(b.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td style={{ verticalAlign: "middle" }}>
                          <span className={`badge ${badge.cls}`}>
                            <badge.Icon size={12} /> {badge.label}
                          </span>
                        </td>
                        <td style={{ verticalAlign: "middle" }}>{b.branch}</td>
                        <td
                          className="pipeline-commit"
                          style={{ verticalAlign: "middle" }}
                        >
                          <span className="pipeline-commit-inner">
                            <GitCommitHorizontal size={13} />{" "}
                            {b.commitHash ? b.commitHash.substring(0, 7) : "—"}
                          </span>
                        </td>
                        <td style={{ verticalAlign: "middle" }}>
                          {ENV_LABEL[b.environment] || b.environment || "—"}
                        </td>
                        <td style={{ verticalAlign: "middle" }}>
                          {b.finishedAt ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <Clock
                                size={12}
                                className="pipeline-duration-icon"
                              />{" "}
                              {Math.floor(b.duration / 60)}m {b.duration % 60}s
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td style={{ verticalAlign: "middle" }}>
                          {formatIST(b.startedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Details Modal */}
      {selectedBuildId && (
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
              maxWidth: "900px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              margin: 0,
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              padding: 0,
            }}
          >
            {/* Modal Header */}
            <div className="bd-header">
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    className="bd-status-dot"
                    style={{
                      background:
                        STATUS_BADGE[buildDetails?.status]?.dot ||
                        "var(--info)",
                    }}
                  />
                  <h2 className="bd-title">Build #{selectedBuildId} Details</h2>
                </div>
                <div className="bd-subtitle">
                  <FolderKanban size={13} /> Project:{" "}
                  {buildDetails?.projectName || "NeuroForge Nexus"}
                </div>
              </div>
              <button
                onClick={() => setSelectedBuildId(null)}
                className="bd-close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
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
              {loadingDetails || !buildDetails ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Loader2
                    size={32}
                    style={{ margin: "0 auto 16px auto", opacity: 0.5 }}
                  />
                  <p>Fetching full pipeline data...</p>
                </div>
              ) : (
                <>
                  {/* Overview Section */}
                  <div className="bd-overview-grid">
                    <div className="bd-overview-card">
                      <div className="bd-overview-top">
                        <span className="bd-overview-label">Trigger</span>
                        <Settings size={15} className="bd-overview-icon" />
                      </div>
                      <div className="bd-overview-value">
                        {buildDetails.triggerSource || "Manual"}
                      </div>
                    </div>
                    <div className="bd-overview-card">
                      <div className="bd-overview-top">
                        <span className="bd-overview-label">Branch</span>
                        <GitBranch size={15} className="bd-overview-icon" />
                      </div>
                      <div className="bd-overview-value">
                        {buildDetails.branch}
                      </div>
                    </div>
                    <div className="bd-overview-card">
                      <div className="bd-overview-top">
                        <span className="bd-overview-label">Started (IST)</span>
                        <Calendar size={15} className="bd-overview-icon" />
                      </div>
                      <div className="bd-overview-value">
                        {formatIST(buildDetails.startedAt) || "—"}
                      </div>
                    </div>
                    <div className="bd-overview-card">
                      <div className="bd-overview-top">
                        <span className="bd-overview-label">
                          Finished (IST)
                        </span>
                        <Clock size={15} className="bd-overview-icon" />
                      </div>
                      <div className="bd-overview-value">
                        {formatIST(buildDetails.finishedAt) || "In progress"}
                      </div>
                    </div>
                  </div>

                  {/* Commit Message Card */}
                  <div className="bd-commit-card">
                    <div className="bd-commit-avatar">
                      <User size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="bd-overview-label"
                        style={{ marginBottom: "4px" }}
                      >
                        Commit Message
                      </div>
                      <div className="bd-commit-text">
                        {buildDetails.commitMessage || "—"}
                      </div>
                    </div>
                    {buildDetails.commitHash && (
                      <span className="bd-hash-chip">
                        <GitCommitHorizontal size={12} />{" "}
                        {buildDetails.commitHash.substring(0, 7)}
                      </span>
                    )}
                  </div>

                  <div
                    style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
                  >
                    {/* Stages Timeline */}
                    <div style={{ flex: "1 1 350px" }}>
                      <h3 className="bd-section-title">
                        <Activity size={14} /> Execution Pipeline Stages
                      </h3>
                      <div className="panel bd-stage-panel">
                        {buildDetails.stages?.map((stage, i) => {
                          const badge =
                            STATUS_BADGE[stage.status] || STATUS_BADGE.PENDING;
                          const isLast = i === buildDetails.stages.length - 1;
                          return (
                            <div className="bd-stage-row" key={i}>
                              <div className="bd-stage-marker-col">
                                <span className="bd-stage-icon">
                                  <badge.Icon size={14} />
                                </span>
                                {!isLast && (
                                  <span className="bd-stage-connector" />
                                )}
                              </div>
                              <div className="bd-stage-body">
                                <span className="bd-stage-name">
                                  {stage.name}
                                </span>
                                <span className="bd-stage-duration">
                                  <Clock size={12} /> {stage.durationSeconds}s
                                </span>
                              </div>
                              <span className={`badge ${badge.cls}`}>
                                <badge.Icon size={12} /> {badge.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div
                      style={{
                        flex: "1 1 350px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                      }}
                    >
                      {/* Test Summary */}
                      {buildDetails.tests && (
                        <div>
                          <h3 className="bd-section-title">
                            <Pencil size={14} /> Quality &amp; Test Metrics
                          </h3>
                          <div
                            className="panel"
                            style={{ margin: 0, padding: "20px" }}
                          >
                            <div className="bd-gauge-wrap">
                              <svg
                                viewBox="0 0 120 120"
                                width="120"
                                height="120"
                              >
                                <circle
                                  cx="60"
                                  cy="60"
                                  r="52"
                                  fill="none"
                                  stroke="var(--line)"
                                  strokeWidth="10"
                                />
                                <circle
                                  cx="60"
                                  cy="60"
                                  r="52"
                                  fill="none"
                                  stroke="var(--accent-3)"
                                  strokeWidth="10"
                                  strokeLinecap="round"
                                  strokeDasharray={2 * Math.PI * 52}
                                  strokeDashoffset={
                                    2 *
                                    Math.PI *
                                    52 *
                                    (1 -
                                      Math.min(
                                        buildDetails.tests.coveragePercent,
                                        100,
                                      ) /
                                        100)
                                  }
                                  transform="rotate(-90 60 60)"
                                />
                              </svg>
                              <div className="bd-gauge-center">
                                <div className="bd-gauge-value">
                                  {buildDetails.tests.coveragePercent.toFixed(
                                    1,
                                  )}
                                  %
                                </div>
                                <div className="bd-gauge-label">
                                  Overall Coverage
                                </div>
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                textAlign: "center",
                                marginTop: "16px",
                              }}
                            >
                              <div
                                style={{
                                  flex: 1,
                                  padding: "10px",
                                  background: "var(--success-soft)",
                                  color: "var(--success)",
                                  borderRadius: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "1.2rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {buildDetails.tests.passed}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Passed
                                </div>
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  padding: "10px",
                                  background: "var(--danger-soft)",
                                  color: "var(--danger)",
                                  borderRadius: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "1.2rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {buildDetails.tests.failed}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Failed
                                </div>
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  padding: "10px",
                                  background: "var(--surface-2)",
                                  color: "var(--ink-soft)",
                                  borderRadius: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "1.2rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {buildDetails.tests.skipped}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Skipped
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Deployment Info */}
                      {buildDetails.deployment && (
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
                            <h3
                              className="bd-section-title"
                              style={{ margin: 0 }}
                            >
                              <Box size={14} /> Post-Build Deployment Status
                            </h3>
                            {buildDetails.deployment.rollbackEligible && (
                              <button
                                onClick={() => handleRollback(buildDetails.id)}
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
                                <Globe size={14} /> Environment
                              </span>
                              <span className="badge badge-in_progress">
                                {buildDetails.deployment.environment}
                              </span>
                            </div>
                            <div className="bd-deploy-row">
                              <span className="bd-deploy-label">
                                <Tag size={14} /> Image Tag
                              </span>
                              <span className="bd-deploy-mono">
                                {buildDetails.deployment.imageTag}
                              </span>
                            </div>
                            <div className="bd-deploy-row">
                              <span className="bd-deploy-label">
                                <HeartPulse size={14} /> Container Health
                              </span>
                              <span className="badge badge-success">
                                {buildDetails.deployment.podsRunning} /{" "}
                                {buildDetails.deployment.podsTotal} Running
                              </span>
                            </div>
                            <div className="bd-deploy-row bd-deploy-row-stacked">
                              <span className="bd-deploy-label">
                                <Cpu size={14} /> Resource Load
                              </span>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "6px",
                                  minWidth: "160px",
                                }}
                              >
                                <div className="bd-resource-line">
                                  <span>CPU</span>
                                  <span>
                                    {buildDetails.deployment.cpuPercent}%
                                  </span>
                                </div>
                                <div className="bd-resource-track">
                                  <div
                                    className="bd-resource-fill"
                                    style={{
                                      width: `${Math.min(buildDetails.deployment.cpuPercent, 100)}%`,
                                    }}
                                  />
                                </div>
                                <div className="bd-resource-line">
                                  <span>Mem</span>
                                  <span>
                                    {buildDetails.deployment.memoryPercent}%
                                  </span>
                                </div>
                                <div className="bd-resource-track">
                                  <div
                                    className="bd-resource-fill"
                                    style={{
                                      width: `${Math.min(buildDetails.deployment.memoryPercent, 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {buildDetails && (
              <div className="bd-footer">
                <span>Dashboard version 2.1</span>
                <span>
                  System on {new Date().toLocaleDateString("en-IN")}{" "}
                  {new Date().toLocaleTimeString("en-IN")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}