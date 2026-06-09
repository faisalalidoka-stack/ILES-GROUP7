import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
// Step 1: extended imports — added publishGrade + getGrades + getFlags
import {
  getUser, logOut, getPlacements, updatePlacement, createPlacement,
  getUsers, publishGrade, getGrades, getFlags,
} from '../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

// emptyPlacement at module scope (used in useState initial value)
const emptyPlacement = {
  student_id: '',
  company_name: '',
  start_date: '',
  end_date: '',
  workplace_supervisor_id: '',
  academic_supervisor_id: '',
=======
import { getUser, logOut, getPlacements, updatePlacement, createPlacement, getUsers, publishGrade } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

const emptyPlacement = {
  student_id: '', company_name: '', start_date: '',
  end_date: '', workplace_supervisor_id: '', academic_supervisor_id: ''
>>>>>>> 3c9ac258a83bade3cee5dffea4cf7cd8dbd433bb
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMsg, setFormMsg] = useState('');
  const [newPlacement, setNewPlacement] = useState(emptyPlacement);
  const [students, setStudents] = useState([]);
  const [wps, setWps] = useState([]);
  const [academics, setAcademics] = useState([]);

  const [students, setStudents] = useState([]);
  const [wps, setWps] = useState([]);
  const [academics, setAcademics] = useState([]);

  // Step 2: grades + flags state
  const [grades, setGrades] = useState([]);
  const [flags, setFlags] = useState([]);
  const [gradeMsg, setGradeMsg] = useState('');

  // Step 3: unified useEffect — placements, users, grades, flags
  useEffect(() => {
    Promise.all([
      getPlacements(),
      getUsers('STUDENT'),
      getUsers('WORKPLACE_SUPERVISOR'),
      getUsers('ACADEMIC_SUPERVISOR'),
      getGrades(),
      getFlags(),
    ])
      .then(([pData, sData, wData, aData, gData, fData]) => {
        const placementsArray = Array.isArray(pData) ? pData : pData.results ?? [];
        setPlacements(placementsArray);
        if (Array.isArray(placementsArray)) {
          setStats({
            pending:   placementsArray.filter(p => p.status === 'Pending').length,
            active:    placementsArray.filter(p => p.status === 'Active').length,
            completed: placementsArray.filter(p => p.status === 'Completed').length,
            rejected:  placementsArray.filter(p => p.status === 'Rejected').length,
          });
        }
        setStudents( Array.isArray(sData) ? sData : sData.results ?? []);
        setWps(      Array.isArray(wData) ? wData : wData.results ?? []);
        setAcademics(Array.isArray(aData) ? aData : aData.results ?? []);
        setGrades(   Array.isArray(gData) ? gData : gData.results ?? []);
        setFlags(    Array.isArray(fData) ? fData : fData.results ?? []);
      })
      .catch(err => {
        console.error('Failed to fetch admin data', err);
        setError('Could not load dashboard. Please refresh.');
      })
      .finally(() => setLoading(false));

    getUsers('STUDENT').then(d => setStudents(Array.isArray(d) ? d : d.results ?? [])).catch(() => {});
    getUsers('WORKPLACE_SUPERVISOR').then(d => setWps(Array.isArray(d) ? d : d.results ?? [])).catch(() => {});
    getUsers('ACADEMIC_SUPERVISOR').then(d => setAcademics(Array.isArray(d) ? d : d.results ?? [])).catch(() => {});
  }, []);

  const handlePublish = async (gradeId) => {
    try {
      await publishGrade(gradeId);
      setPlacements(prev => prev.map(p =>
        p.final_grade?.id === gradeId
          ? { ...p, final_grade: { ...p.final_grade, published: true } }
          : p
      ));
    } catch (err) {
      setError('Publish failed: ' + err.message);
    }
  };

  const handleActivate = (id) => {
    updatePlacement(id, { status: 'Active' })
      .then(() => {
        setPlacements(prev =>
          prev.map(p => (p.id === id ? { ...p, status: 'Active' } : p))
        );
        setStats(prev => {
          if (!prev) return prev;
          return { ...prev, pending: prev.pending - 1, active: prev.active + 1 };
        });
      })
      .catch(err => console.error('Failed to update placement', err));
  };

  // Step 4: handlePublish — calls publishGrade, refreshes grades list
  const handlePublish = async (gradeId) => {
    try {
      await publishGrade(gradeId); // POST /grades/<id>/publish/
      setGradeMsg('Grade published successfully!');
      // Refresh grades list so the panel reflects the change
      const fresh = await getGrades();
      setGrades(Array.isArray(fresh) ? fresh : fresh.results ?? []);
      // Also mark the placement row as published in local state
      setPlacements(prev =>
        prev.map(p =>
          p.final_grade?.id === gradeId
            ? { ...p, final_grade: { ...p.final_grade, published: true } }
            : p
        )
      );
      setTimeout(() => setGradeMsg(''), 3000);
    } catch (err) {
      setGradeMsg('Publish failed: ' + (err.message || 'Please try again.'));
    }
  };

  const handleLogout = () => {
    logOut();
    navigate('/');
  };

  const handleFormChange = (e) => {
    setNewPlacement(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreatePlacement = async () => {
    setFormMsg('');
    if (!newPlacement.student_id || !newPlacement.company_name.trim()) {
      setFormMsg('Error: Select a student and enter the company name.');
      return;
    }
    try {
      const created = await createPlacement(newPlacement);
      setPlacements(prev => [created, ...prev]);
      setStats(prev => {
        if (!prev) return { pending: 1, active: 0, completed: 0, rejected: 0 };
        return { ...prev, pending: prev.pending + 1 };
      });
      setFormMsg('Placement created successfully!');
      setShowForm(false);
      setNewPlacement(emptyPlacement);
      setTimeout(() => setFormMsg(''), 3000);
    } catch (err) {
      setFormMsg('Error: ' + (err.message || 'Creation failed'));
    }
  };

  const COLORS = ['#FBBF24', '#60A5FA', '#34D399', '#F87171'];

  const StatsPanel = () => {
    if (!stats) return null;
    const pieData = [
      { name: 'Pending',   value: stats.pending },
      { name: 'Active',    value: stats.active },
      { name: 'Completed', value: stats.completed },
      { name: 'Rejected',  value: stats.rejected },
    ].filter(d => d.value > 0);

    return (
      <div className="admin-stats-panel">
        <h3>Placement Status Overview</h3>
        <div className="admin-kpi-row">
          <div className="admin-kpi-card">
            <span className="admin-kpi-val">{placements.length}</span>
            <span className="admin-kpi-label">Placements</span>
          </div>
          <div className="admin-kpi-card">
            <span className="admin-kpi-val">{students.length}</span>
            <span className="admin-kpi-label">Students</span>
          </div>
          <div className="admin-kpi-card">
            <span className="admin-kpi-val">{wps.length}</span>
            <span className="admin-kpi-label">Workplace Supervisors</span>
          </div>
          <div className="admin-kpi-card">
            <span className="admin-kpi-val">{academics.length}</span>
            <span className="admin-kpi-label">Academic Supervisors</span>
          </div>
        </div>
        {pieData.length > 0 ? (
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
        ) : (
          <p className="admin-empty">
            No placement records yet. Create the first placement using the + New Placement button.
          </p>
        )}
      </div>
    );
  };

  if (loading) return <div className="admin-loading">Loading admin dashboard...</div>;
  if (error)   return <div className="admin-error">{error}</div>;

  return (
    <div className="ad-root">
      <div className="ad-header">
        <h1 className="ad-title">
          Welcome, {user?.username || user?.email?.split('@')[0] || 'Admin'} — Admin Dashboard
        </h1>
        <button className="ad-logout" onClick={handleLogout}>Logout</button>
      </div>

      {formMsg && (
        <div className={formMsg.startsWith('Error') ? 'admin-error' : 'admin-msg'}>
          {formMsg}
        </div>
      )}

      <button className="admin-add-btn" onClick={() => setShowForm(!showForm)}>
<<<<<<< HEAD
        {showForm ? 'Cancel' : '+ New Placement'}
=======
        {showForm ? "Cancel" : "+ New Placement"}
>>>>>>> 3c9ac258a83bade3cee5dffea4cf7cd8dbd433bb
      </button>

      {showForm && (
        <div className="admin-form-card">
          <h3>Create Placement</h3>
          <div className="admin-field">
            <label>Student</label>
            <select
              name="student_id"
              value={newPlacement.student_id}
              onChange={handleFormChange}
              title="Select the student who will be attached to this internship placement."
            >
              <option value="">Select student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.username} ({s.email})</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Company Name</label>
            <input
              name="company_name"
              value={newPlacement.company_name}
              onChange={handleFormChange}
              title="Enter the company or organization where the student is placed."
            />
          </div>
          <div className="admin-field">
            <label>Start Date</label>
            <input
              type="date"
              name="start_date"
              value={newPlacement.start_date}
              onChange={handleFormChange}
              title="Choose the first day of the internship."
            />
          </div>
          <div className="admin-field">
            <label>End Date</label>
            <input
              type="date"
              name="end_date"
              value={newPlacement.end_date}
              onChange={handleFormChange}
              title="Choose the last day of the internship. It must be after the start date."
            />
          </div>
          <div className="admin-field">
            <label>Workplace Supervisor</label>
            <select
              name="workplace_supervisor_id"
              value={newPlacement.workplace_supervisor_id}
              onChange={handleFormChange}
              title="Select the workplace supervisor assigned to this student."
            >
              <option value="">Not assigned yet</option>
              {wps.map(s => (
                <option key={s.id} value={s.id}>{s.username} ({s.email})</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Academic Supervisor</label>
            <select
              name="academic_supervisor_id"
              value={newPlacement.academic_supervisor_id}
              onChange={handleFormChange}
              title="Select the academic supervisor assigned to this student."
            >
              <option value="">Not assigned yet</option>
              {academics.map(s => (
                <option key={s.id} value={s.id}>{s.username} ({s.email})</option>
              ))}
            </select>
          </div>
          <button className="admin-submit-btn" onClick={handleCreatePlacement}>Create</button>
        </div>
      )}

      {stats && <StatsPanel />}

      {/* Placements table */}
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
<<<<<<< HEAD
              <th>Student</th>
              <th>Company</th>
              <th>Status</th>
              <th>Academic Supervisor</th>
              <th>Workplace Supervisor</th>
              <th>Action</th>
              <th>Grade</th>
=======
              <th>Student</th><th>Company</th><th>Status</th>
              <th>Academic Supervisor</th><th>Workplace Supervisor</th>
              <th>Action</th><th>Grade</th>
>>>>>>> 3c9ac258a83bade3cee5dffea4cf7cd8dbd433bb
            </tr>
          </thead>
          <tbody>
            {placements.length === 0 ? (
              <tr><td colSpan="7" className="admin-empty">No placements found.</td></tr>
            ) : placements.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? 'ad-row-alt' : ''}>
                <td>{p.student?.username || '—'}</td>
                <td>{p.company_name}</td>
<<<<<<< HEAD
                <td>
                  <span className={`ad-badge ad-badge-${String(p.status).toLowerCase()}`}>
                    {p.status}
                  </span>
                </td>
                <td>{p.academic_supervisor?.username || '—'}</td>
                <td>{p.workplace_supervisor?.username || '—'}</td>
                <td>
                  {p.status === 'Pending'
                    ? <button className="ad-activate-btn" onClick={() => handleActivate(p.id)}>Set Active</button>
                    : '—'}
=======
                <td><span className={`ad-badge ad-badge-${String(p.status).toLowerCase()}`}>{p.status}</span></td>
                <td>{p.academic_supervisor?.username || "—"}</td>
                <td>{p.workplace_supervisor?.username || "—"}</td>
                <td>
                  {p.status === "Pending"
                    ? <button className="ad-activate-btn" onClick={() => handleActivate(p.id)}>Set Active</button>
                    : "—"}
>>>>>>> 3c9ac258a83bade3cee5dffea4cf7cd8dbd433bb
                </td>
                <td>
                  {p.final_grade && !p.final_grade.published
                    ? <button className="ad-activate-btn" onClick={() => handlePublish(p.final_grade.id)}>Publish Grade</button>
<<<<<<< HEAD
                    : p.final_grade?.published ? 'Published' : '—'}
=======
                    : p.final_grade?.published ? "Published" : "—"}
>>>>>>> 3c9ac258a83bade3cee5dffea4cf7cd8dbd433bb
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Step 5: Unpublished Grades panel */}
      <section style={{ marginTop: 32 }}>
        <h2>Unpublished Grades</h2>
        {gradeMsg && (
          <div className={gradeMsg.startsWith('Publish failed') ? 'admin-error' : 'admin-msg'}>
            {gradeMsg}
          </div>
        )}
        {grades.filter(g => !g.published).length === 0 ? (
          <p className="admin-empty">All grades have been published.</p>
        ) : (
          grades.filter(g => !g.published).map(g => (
            <div
              key={g.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 0',
                borderBottom: '1px solid #D6E4F7',
              }}
            >
              <span>{g.placement?.student?.username ?? 'Student'}</span>
              <span>{g.grade_letter} — {g.score}/100</span>
              {g.remarks && <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>{g.remarks}</span>}
              <button
                className="ad-activate-btn"
                onClick={() => handlePublish(g.id)}
              >
                Publish
              </button>
            </div>
          ))
        )}
      </section>

      {/* Step 6: Flags panel */}
      <section style={{ marginTop: 32 }}>
        <h2>Flagged Issues</h2>
        {flags.length === 0 ? (
          <p className="admin-empty">No flags have been raised.</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Raised By</th>
                  <th>Student</th>
                  <th>Reason</th>
                  <th>Details</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((f, i) => (
                  <tr key={f.id} className={i % 2 === 0 ? 'ad-row-alt' : ''}>
                    <td>{f.raised_by?.username ?? '—'}</td>
                    <td>{f.placement?.student?.username ?? f.student?.username ?? '—'}</td>
                    <td>{f.reason ?? '—'}</td>
                    <td style={{ maxWidth: 260, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {f.details ?? f.description ?? '—'}
                    </td>
                    <td>
                      {f.created_at
                        ? new Date(f.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <span
                        className={`ad-badge ad-badge-${f.resolved ? 'completed' : 'pending'}`}
                      >
                        {f.resolved ? 'Resolved' : 'Open'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}