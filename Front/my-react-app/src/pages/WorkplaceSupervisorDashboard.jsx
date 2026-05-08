import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUser, logOut, getPlacements, getWeeklyLogs,
  updateWeeklyLog, createEvaluation
} from '../services/api';
import './WorkplaceSupervisorDashboard.css';

export default function WorkplaceSupervisorDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState({});
  const [activeTab, setActiveTab] = useState('logs');
  const [evalForm, setEvalForm] = useState({
    placement: '', technical_skills: 5,
    communication_skills: 5, punctuality: 5, overall_comments: ''
  });
  const [evalMsg, setEvalMsg] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pData, lData] = await Promise.all([getPlacements(), getWeeklyLogs()]);
      setPlacements(Array.isArray(pData) ? pData : pData.results ?? []);
      setLogs(Array.isArray(lData) ? lData : lData.results ?? []);
    } catch (err) {
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (logId, value) => {
    setComments(prev => ({ ...prev, [logId]: value }));
  };

  const handleReview = async (logId, decision) => {
    try {
      await updateWeeklyLog(logId, {
        status: decision,
        supervisor_comment: comments[logId] || ''
      });
      setLogs(prev => prev.map(l =>
        l.id === logId
          ? { ...l, status: decision, supervisor_comment: comments[logId] || '' }
          : l
      ));
      setComments(prev => { const n = { ...prev }; delete n[logId]; return n; });
    } catch (err) {
      alert('Failed to update log status: ' + err.message);
    }
  };

  const handleEvalChange = (e) => {
    const { name, value } = e.target;
    setEvalForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEvalSubmit = async () => {
    try {
      await createEvaluation(evalForm);
      setEvalMsg('Evaluation submitted successfully!');
      setEvalForm({
        placement: '', technical_skills: 5,
        communication_skills: 5, punctuality: 5, overall_comments: ''
      });
      setTimeout(() => setEvalMsg(''), 3000);
    } catch (err) {
      setEvalMsg('Error: ' + err.message);
    }
  };

  const handleLogout = () => {
    logOut();
    navigate('/');
  };

  if (loading) return <div className="ws-loading">Loading...</div>;

  return (
    <div className="ws-root">
      <aside className="ws-sidebar">
        <div className="ws-logo">ILES</div>
        <nav className="ws-nav">
          <button
            className={`ws-tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}>
            Review Logs
          </button>
          <button
            className={`ws-tab ${activeTab === 'evaluate' ? 'active' : ''}`}
            onClick={() => setActiveTab('evaluate')}>
            Submit Evaluation
          </button>
        </nav>
        <button className="ws-logout" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="ws-main">
        <h1 className="ws-title">Welcome, {user?.email} — Workplace Supervisor</h1>
        {error && <div className="ws-error">{error}</div>}

        {activeTab === 'logs' && (
          <section>
            <h2>Student Weekly Logs</h2>
            {logs.length === 0
              ? <p>No logs submitted yet.</p>
              : logs.map(log => (
                <div key={log.id} className="ws-log-card">
                  <div className="ws-log-header">
                    <span><strong>{log.student?.username || 'Student'}</strong></span>
                    <span>Week {log.week}</span>
                    <span className={`ws-status ws-status-${log.status.toLowerCase()}`}>
                      {log.status}
                    </span>
                  </div>
                  <p><strong>Description:</strong> {log.description}</p>
                  <p><strong>Hours:</strong> {log.hours}h</p>
                  <p><strong>Skills:</strong> {log.skills}</p>
                  <p><strong>Challenges:</strong> {log.challenges}</p>
                  {log.status === 'Submitted' && (
                    <div className="ws-review-box">
                      <textarea
                        placeholder="Add a comment (optional)"
                        value={comments[log.id] || ''}
                        onChange={e => handleCommentChange(log.id, e.target.value)}
                        rows={2}
                        className="ws-comment"
                      />
                      <div className="ws-actions">
                        <button className="ws-approve" onClick={() => handleReview(log.id, 'Approved')}>
                          Approve
                        </button>
                        <button className="ws-reject" onClick={() => handleReview(log.id, 'Rejected')}>
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </section>
        )}

        {activeTab === 'evaluate' && (
          <section className="ws-eval-section">
            <h2>Submit Evaluation Form</h2>
            {evalMsg && <div className="ws-eval-msg">{evalMsg}</div>}
            <div className="ws-eval-form">
              <label>Placement</label>
              <select name="placement" value={evalForm.placement} onChange={handleEvalChange}>
                <option value="">Select placement</option>
                {placements.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.student?.username} — {p.company_name}
                  </option>
                ))}
              </select>
              {['technical_skills', 'communication_skills', 'punctuality'].map(field => (
                <div key={field} className="ws-score-row">
                  <label>{field.replace(/_/g, ' ')}</label>
                  <input type="number" name={field} min="0" max="10"
                    value={evalForm[field]} onChange={handleEvalChange} />
                  <span>/10</span>
                </div>
              ))}
              <label>Overall Comments</label>
              <textarea name="overall_comments" rows={4}
                value={evalForm.overall_comments} onChange={handleEvalChange}
                placeholder="Remarks on student performance..." />
              <button className="ws-submit-eval" onClick={handleEvalSubmit}>
                Submit Evaluation
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
