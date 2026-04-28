import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeeklyLogs, updateWeeklyLog, logOut } from '../services/api';
import './WorkplaceSupervisorDashboard.css';

function WorkplaceSupervisorDashboard() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState({});

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWeeklyLogs();
      setLogs(data);
    } catch (err) {
      setError('Failed to load logs. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (logId, decision) => {
    const currentComment = comment[logId] || '';
    try {
      await updateWeeklyLog(logId, {
        status: decision,
        supervisor_comment: currentComment,
      });
      fetchLogs();
      setComment(prev => ({ ...prev, [logId]: '' }));
    } catch (err) {
      setError(`Failed to ${decision} log. Try again.`);
      console.error(err);
    }
  };

  const handleCommentChange = (logId, value) => {
    setComment(prev => ({ ...prev, [logId]: value }));
  };

  const handleLogout = () => {
    logOut();
    navigate('/');
  };

  if (loading) return <div className="loading">Loading logs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Workplace Supervisor Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <p>Review weekly logs from your assigned students.</p>

      {logs.length === 0 ? (
        <p>No logs to review.</p>
      ) : (
        <div className="logs-list">
          {logs.map(log => (
            <div key={log.id} className="log-card">
              <div className="log-header">
                <strong>Student:</strong> {log.student?.username || 'Unknown'}
                <span className="week">Week {log.week}</span>
              </div>
              <div className="log-details">
                <p><strong>Tasks:</strong> {log.description}</p>
                <p><strong>Hours:</strong> {log.hours}</p>
                <p><strong>Current Status:</strong> <span className={`status-badge ${log.status.toLowerCase()}`}>{log.status}</span></p>
              </div>
              <div className="review-section">
                <textarea
                  placeholder="Add a comment (optional)"
                  value={comment[log.id] || ''}
                  onChange={(e) => handleCommentChange(log.id, e.target.value)}
                  rows="2"
                />
                <div className="action-buttons">
                  <button onClick={() => handleReview(log.id, 'APPROVED')} className="approve-btn">Approve</button>
                  <button onClick={() => handleReview(log.id, 'REJECTED')} className="reject-btn">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkplaceSupervisorDashboard;