import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logOut, getPlacements, updatePlacement, createPlacement, publishGrade } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [wps, setWps] = useState([]);
  const [academics, setAcademics] = useState([]);

  // Create placement form state
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
        const placementsArray = data.results ?? data;
        setPlacements(placementsArray);

        // Compute stats for pie chart
        if (Array.isArray(placementsArray)) {
          const pending = placementsArray.filter(p => p.status === 'Pending').length;
          const active = placementsArray.filter(p => p.status === 'Active').length;
          const completed = placementsArray.filter(p => p.status === 'Completed').length;
          const rejected = placementsArray.filter(p => p.status === 'Rejected').length;
          setStats({ pending, active, completed, rejected });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch placements', err);
        setError('Could not load placements. Please refresh.');
      })
      .finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    getUsers('STUDENT').then(setStudents);
    getUsers('WORKPLACE_SUPERVISOR').then(setWps);
    getUsers('ACADEMIC_SUPERVISOR').then(setAcademics);
  }, []);

  const handlePublish = async (gradeId) => {
  try {
  await publishGrade(gradeId);
  setFormMsg('Grade published successfully!');
  } catch (err) { setFormMsg('Error: ' + err.message); }
  };

  export const getUsers = (role) => apiFetch(`/users/${role ? '?role='+role : ''}`)

  const handleActivate = (id) => {
    updatePlacement(id, { status: 'Active' })
      .then(() => {
        setPlacements((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'Active' } : p))
        );
        // Update stats after activation
        setStats(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            pending: prev.pending - 1,
            active: prev.active + 1,
          };
        });
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
      // Update stats (add to pending count)
      setStats(prev => {
        if (!prev) return { pending: 1, active: 0, completed: 0, rejected: 0 };
        return { ...prev, pending: prev.pending + 1 };
      });
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

  const COLORS = ['#E65100', '#1A73E8', '#2E7D32', '#C62828'];

  const StatsPanel = ({ stats }) => {
    if (!stats) return null;
    const pieData = [
      { name: 'Pending', value: stats.pending },
      { name: 'Active', value: stats.active },
      { name: 'Completed', value: stats.completed },
      { name: 'Rejected', value: stats.rejected },
    ].filter(d => d.value > 0);
    if (pieData.length === 0) return null;
    return (
      <div className="admin-stats-panel">
        <h3>Placement Status Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading placements...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="ad-root">
      <div className="ad-header">
        <h1 className="ad-title">Admin Dashboard</h1>
        <button className="ad-logout" onClick={handleLogout}>Logout</button>
      </div>

      {formMsg && <div className="admin-msg">{formMsg}</div>}

      <button className="admin-add-btn" onClick={() => setShowForm(!showForm)}>
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

      <StatsPanel stats={stats} />

      <div className="ad-table-wrap">
        <table className="ad-table">
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
            {placements.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? 'ad-row-alt' : ''}>
                <td>{p.student?.username || p.student_id || '—'}</td>
                <td>{p.company_name}</td>
                <td>
                  <span className={`ad-badge ad-badge-${p.status.toLowerCase()}`}>
                    {p.status}
                  </span>
                </td>
                <td>{p.academic_supervisor?.username || '—'}</td>
                <td>{p.workplace_supervisor?.username || '—'}</td>
                <td>
                  {p.status === 'Pending' && (
                    <button className="ad-activate-btn" onClick={() => handleActivate(p.id)}>
                      Set Active
                    </button>
                  )}
                </td>
                <td>
                  {p.final_grade && !p.final_grade.published && (
                  <button onClick={() => handlePublish(p.final_grade.id)}>
                    Publish Grade
                  </button>
                )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}