import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logOut, getPlacements, updatePlacement, createPlacement } from '../services/api';
import './AdminDashboard.css';
// If you have a CSS file, import it; otherwise remove or comment out
// import './AdminDashboard.css';

export default function AdminDashboard() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formMsg, setFormMsg] = useState('');
  const [newPlacement, setNewPlacement] = useState({
     student_id: '',
     company_name: '',
     start_date: '',
     end_date: '',
     workplace_supervisor_id: '',
     academic_supervisor_id: '',
  });

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

  const handleFormChange = (e) => {
  setNewPlacement(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreatePlacement = async () => {
    try {
      const created = await createPlacement(newPlacement);
      setPlacements(prev => [created, ...prev]);
      setFormMsg('Placement created successfully!');
      setShowForm(false);
      setNewPlacement({
        student_id: '',
        company_name: '',
        start_date: '',
        end_date: '',
        workplace_supervisor_id: '',
        academic_supervisor_id: '',
      });
    setTimeout(() => setFormMsg(''), 3000);
    } catch (err) {
      setFormMsg('Error: ' + (err.message || 'Creation failed'));
      console.error(err);
   }
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
       {formMsg && <div className="admin-msg">{formMsg}</div>}
        <button onClick={() => setShowForm(!showForm)} className="admin-add-btn">
          {showForm ? 'Cancel' : '+ New Placement'}
        </button>
        {showForm && (
          <div className="admin-form-card">
            <h3>Create Placement</h3>
            <div className="admin-field">
              <label>Student ID</label>
              <input name="student_id" value={newPlacement.student_id} onChange={handleFormChange} />
            </div>
            <div className="admin-field">
              <label>Company Name</label>
              <input name="company_name" value={newPlacement.company_name} onChange={handleFormChange} />
            </div>
            <div className="admin-field">
              <label>Start Date</label>
              <input type="date" name="start_date" value={newPlacement.start_date} onChange={handleFormChange} />
            </div>
            <div className="admin-field">
              <label>End Date</label>
              <input type="date" name="end_date" value={newPlacement.end_date} onChange={handleFormChange} />
            </div>
            <div className="admin-field">
              <label>Workplace Supervisor ID</label>
              <input name="workplace_supervisor_id" value={newPlacement.workplace_supervisor_id} onChange={handleFormChange} />
            </div>
            <div className="admin-field">
              <label>Academic Supervisor ID</label>
              <input name="academic_supervisor_id" value={newPlacement.academic_supervisor_id} onChange={handleFormChange} />
            </div>
            <button className="admin-submit-btn" onClick={handleCreatePlacement}>Create</button>
          </div>
        )}
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