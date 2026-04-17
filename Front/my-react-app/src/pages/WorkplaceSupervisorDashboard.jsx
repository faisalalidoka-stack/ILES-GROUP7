import { useState, useEffect } from 'react';
import { getWeeklyLogs, updateWeeklyLog } from '../services/api';
import './WorkplaceSupervisorDashboard.css';  // we'll create this next

function WorkplaceSupervisorDashboard() {
  // State variables
  const [logs, setLogs] = useState([]);        // stores the list of logs
  const [loading, setLoading] = useState(true); // true while fetching
  const [error, setError] = useState('');       // error message if any
  const [comment, setComment] = useState({});   // stores comment for each log (key = log id)

  // Fetch logs when the component first loads
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

  // Handle approve/reject
  const handleReview = async (logId, decision) => {
    const currentComment = comment[logId] || '';
    try {
      await updateWeeklyLog(logId, {
        status: decision,           // 'APPROVED' or 'REJECTED'
        supervisor_comment: currentComment,
      });
      // Refresh the list to show updated status
      fetchLogs();
      // Clear comment for this log
      setComment(prev => ({ ...prev, [logId]: '' }));
    } catch (err) {
      setError(`Failed to ${decision} log. Try again.`);
      console.error(err);
    }
  };

  const handleCommentChange = (logId, value) => {
    setComment(prev => ({ ...prev, [logId]: value }));
  };

  if (loading) return <div className="loading">Loading logs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <h2>Workplace Supervisor Dashboard</h2>
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
                <p><strong>Tasks:</strong> {log.tasks}</p>
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
