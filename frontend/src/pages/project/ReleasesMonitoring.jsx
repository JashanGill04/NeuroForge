import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Rocket, Tag, CheckCircle2, Clock, AlertTriangle, 
  Plus, ExternalLink, ShieldCheck, ChevronRight, Layers 
} from 'lucide-react';
import { releaseApi } from '../../api/releases';

const styles = `
  .releases-container { display: flex; flex-direction: column; gap: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
  .header-info h1 { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0 0 0.25rem 0; }
  .header-info p { font-size: 0.875rem; color: #a1a1aa; margin: 0; }
  .btn-primary { display: flex; align-items: center; gap: 0.5rem; background-color: #4f46e5; color: #fff; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; border: none; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); transition: 0.2s; }
  .btn-primary:hover { background-color: #6366f1; }
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
  .kpi-card { background-color: #18181b; border: 1px solid #27272a; border-radius: 0.75rem; padding: 1rem; }
  .kpi-header { display: flex; align-items: center; justify-content: space-between; color: #a1a1aa; }
  .kpi-label { font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
  .kpi-value { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0.5rem 0 0 0; }
  .icon-blue { color: #818cf8; }
  .icon-green { color: #34d399; }
  .icon-yellow { color: #fbbf24; }
  .releases-list { background-color: #18181b; border: 1px solid #27272a; border-radius: 0.75rem; display: flex; flex-direction: column; overflow: hidden; }
  .release-item { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #27272a; }
  .release-item:last-child { border-bottom: none; }
  .release-info-wrapper { display: flex; gap: 1rem; align-items: flex-start; }
  .release-icon { background-color: #27272a; color: #818cf8; padding: 0.75rem; border-radius: 0.5rem; margin-top: 0.25rem; }
  .release-title-row { display: flex; align-items: center; gap: 0.75rem; }
  .release-version { font-family: monospace; font-size: 0.875rem; font-weight: 600; color: #fff; }
  .release-title { font-size: 1rem; font-weight: 500; color: #e4e4e7; margin: 0; }
  .status-badge { padding: 0.25rem 0.625rem; font-size: 0.75rem; font-weight: 600; border-radius: 9999px; border: 1px solid transparent; }
  .status-released { background-color: rgba(16, 185, 129, 0.1); color: #34d399; border-color: rgba(16, 185, 129, 0.2); }
  .status-staging { background-color: rgba(59, 130, 246, 0.1); color: #60a5fa; border-color: rgba(59, 130, 246, 0.2); }
  .status-draft { background-color: rgba(113, 113, 122, 0.1); color: #a1a1aa; border-color: rgba(113, 113, 122, 0.2); }
  .status-cancelled { background-color: rgba(244, 63, 94, 0.1); color: #fb7185; border-color: rgba(244, 63, 94, 0.2); }
  .release-desc { font-size: 0.875rem; color: #a1a1aa; margin: 0.25rem 0 0 0; }
  .release-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #71717a; font-family: monospace; margin-top: 0.5rem; }
  .release-actions { display: flex; align-items: center; gap: 0.75rem; }
  .btn-secondary { background-color: #27272a; color: #d4d4d8; border: none; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: 0.2s; }
  .btn-secondary:hover { background-color: #3f3f46; }
  .btn-icon { background: none; border: none; color: #a1a1aa; cursor: pointer; padding: 0.5rem; }
  .btn-icon:hover { color: #fff; }
  .empty-state { padding: 2rem; text-align: center; color: #71717a; }
  .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 1rem; }
  .modal-content { background-color: #18181b; border: 1px solid #27272a; border-radius: 1rem; width: 100%; max-width: 32rem; padding: 1.5rem; }
  .modal-title { font-size: 1.125rem; font-weight: 700; color: #fff; margin: 0 0 1rem 0; }
  .form-group { margin-bottom: 1rem; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .form-label { display: block; font-size: 0.75rem; font-weight: 500; color: #a1a1aa; margin-bottom: 0.25rem; }
  .form-input, .form-select, .form-textarea { width: 100%; background-color: #27272a; border: 1px solid #3f3f46; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #fff; box-sizing: border-box; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #6366f1; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
  .btn-text { background: none; border: none; color: #a1a1aa; font-size: 0.875rem; cursor: pointer; }
  .btn-text:hover { color: #fff; }
`;

export default function Releases() {
  const { projectId } = useParams();
  const [releases, setReleases] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    version: '', title: '', description: '', targetDate: '', environment: 'STAGING'
  });

  useEffect(() => {
    fetchReleaseData();
  }, [projectId]);

  const fetchReleaseData = async () => {
    try {
      setLoading(true);
      const [releaseRes, kpiRes] = await Promise.all([
        releaseApi.getProjectReleases(projectId),
        releaseApi.getReleaseKpis(projectId)
      ]);
      setReleases(releaseRes.data || []);
      setKpis(kpiRes.data || null);
    } catch (err) {
      console.error('Failed to fetch release records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRelease = async (e) => {
    e.preventDefault();
    try {
      await releaseApi.createRelease(projectId, formData);
      setIsModalOpen(false);
      setFormData({ version: '', title: '', description: '', targetDate: '', environment: 'STAGING' });
      fetchReleaseData();
    } catch (err) {
      console.error('Error creating release:', err);
    }
  };

  const getStatusClass = (status) => {
    const map = {
      RELEASED: 'status-released',
      STAGING: 'status-staging',
      DRAFT: 'status-draft',
      CANCELLED: 'status-cancelled'
    };
    return map[status] || map.DRAFT;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="releases-container">
        
        {/* Header */}
        <div className="page-header">
          <div className="header-info">
            <h1>Releases & Deployments</h1>
            <p>Track production rollout schedules, build tags, and release notes.</p>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Create Release
          </button>
        </div>

        {/* Release KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Total Releases</span>
              <Rocket size={18} className="icon-blue" />
            </div>
            <p className="kpi-value">{kpis?.totalReleases ?? releases.length}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Active Version</span>
              <Tag size={18} className="icon-green" />
            </div>
            <p className="kpi-value">{kpis?.activeVersion || 'v1.0.0'}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Deployment Frequency</span>
              <Clock size={18} className="icon-yellow" />
            </div>
            <p className="kpi-value">{kpis?.deployFrequency || '2.4 / week'}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Success Rate</span>
              <ShieldCheck size={18} className="icon-green" />
            </div>
            <p className="kpi-value">{kpis?.successRate || '99.2%'}</p>
          </div>
        </div>

        {/* Releases List */}
        <div className="releases-list">
          {loading ? (
            <div className="empty-state">Loading release pipelines...</div>
          ) : releases.length === 0 ? (
            <div className="empty-state">No releases registered for this project yet.</div>
          ) : (
            releases.map((release) => (
              <div key={release.id} className="release-item">
                <div className="release-info-wrapper">
                  <div className="release-icon">
                    <Layers size={20} />
                  </div>
                  <div>
                    <div className="release-title-row">
                      <span className="release-version">{release.version}</span>
                      <h3 className="release-title">{release.title}</h3>
                      <span className={`status-badge ${getStatusClass(release.status)}`}>
                        {release.status}
                      </span>
                    </div>
                    <p className="release-desc">{release.description || 'No release description provided.'}</p>
                    <div className="release-meta">
                      <span>Target: {release.targetDate || 'Immediate'}</span>
                      <span>•</span>
                      <span>Env: {release.environment || 'Production'}</span>
                    </div>
                  </div>
                </div>
                <div className="release-actions">
                  <button className="btn-secondary">Changelog</button>
                  <button className="btn-icon"><ChevronRight size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Release Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Create New Release</h2>
              <form onSubmit={handleCreateRelease}>
                <div className="form-group">
                  <label className="form-label">Version Tag</label>
                  <input
                    type="text"
                    placeholder="v1.2.0"
                    required
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Release Title</label>
                  <input
                    type="text"
                    placeholder="Q3 Performance Optimization & API Hotfixes"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Release Notes / Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                    placeholder="Summary of changes and migration scripts..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Environment</label>
                    <select
                      value={formData.environment}
                      onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                      className="form-select"
                    >
                      <option value="STAGING">Staging</option>
                      <option value="PRODUCTION">Production</option>
                      <option value="CANARY">Canary</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Date</label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-text">Cancel</button>
                  <button type="submit" className="btn-primary">Deploy Release</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}