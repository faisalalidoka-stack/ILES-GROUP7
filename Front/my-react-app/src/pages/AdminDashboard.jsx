import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logOut, getPlacements, updatePlacement } from '../services/api';
// If you have a CSS file, import it; otherwise remove or comment out
// import './AdminDashboard.css';

export default function AdminDashboard() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getPlacements()
      .then((data) => {
        setPlacements(data.results ?? data);
      })
      .catch((err) => {
        console.error('Failed to fetch placements', err);
        setError('Could not load placements. Please refresh.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleActivate = (id) => {
    updatePlacement(id, { status: 'Active' })
      .then(() => {
        setPlacements((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'Active' } : p))
        );
      })
      .catch((err) => console.error('Failed to update placement', err));
  };

  const handleLogout = () => {
    logOut();
    navigate('/');
  };

  if (loading) return <div className="loading">Loading placements...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div style={{ position: 'relative', padding: '20px' }}>
      {/* Logout button – inline style ensures visibility even without CSS */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '8px 12px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>

      <h2>Admin Dashboard</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Company</th>
            <th>Status</th>
            <th>Academic Supervisor</th>
            <th>Workplace Supervisor</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {placements.map((p) => (
            <tr key={p.id}>
              <td>{p.student_name || p.student?.username}</td>
              <td>{p.company_name || p.company}</td>
              <td>{p.status}</td>
              <td>{p.academic_supervisor?.username || p.academic_supervisor || '—'}</td>
              <td>{p.workplace_supervisor?.username || p.workplace_supervisor || '—'}</td>
              <td>
                {p.status !== 'Active' && (
                  <button onClick={() => handleActivate(p.id)}>Set Active</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}