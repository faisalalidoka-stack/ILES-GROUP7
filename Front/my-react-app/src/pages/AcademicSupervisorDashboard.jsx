import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logOut, getPlacements, getWeeklyLogs, getGrades, getEvaluations, createGrade, publishGrade } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AcademicSupervisorDashboard.css';

export default function AcademicSupervisorDashboard() {
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [grades, setGrades] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradeForm, setGradeForm] = useState({ score: '', remarks: '' });
  const [gradeMsg, setGradeMsg] = useState('');
  const [activePlacementId, setActivePlacementId] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const [publishMsg, setPublishMsg] = useState('');

  const navigate = useNavigate();
  const user = getUser();
  const displayName = user?.username || user?.email?.split("@")[0] || "Academic Supervisor";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [pData, lData, gData, eData] = await Promise.all([getPlacements(), getWeeklyLogs(), getGrades(), getEvaluations()]);
      setPlacements(Array.isArray(pData) ? pData : pData.results ?? []);
      setLogs(Array.isArray(lData) ? lData : lData.results ?? []);
      setGrades(Array.isArray(gData) ? gData : gData.results ?? []);
      setEvaluations(Array.isArray(eData) ? eData : eData.results ?? []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logOut();
    navigate("/");
  };

  const handleGradeChange = (e) => {
    setGradeForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openGradeForm = (placementId) => {
    setActivePlacementId(placementId);
    setGradeForm({ academic_score: "", remarks: "" });
    setGradeMsg("");
  };

  const handleGradeSubmit = async (placementId) => {
    try {
      const payload = {
        placement: placementId,
        academic_score: Number(gradeForm.score),
        remarks: gradeForm.remarks
      };
      await createGrade(payload);
      setGradeMsg('Grade submitted successfully!');
      setActivePlacementId(null);
      setGradeForm({ score: '', remarks: '' });
      const data = await getGrades();
      setGrades(Array.isArray(data) ? data : data.results ?? []);
      setTimeout(() => setGradeMsg(""), 3000);
    } catch (err) {
      setGradeMsg("Error: " + (err.message || "Submission failed"));
    }
  };

  const getChartData = () => {
    if (!evaluations.length) return [];
    const avgTech = evaluations.reduce((sum, e) => sum + (e.technical_skills || 0), 0) / evaluations.length;
    const avgComm = evaluations.reduce((sum, e) => sum + (e.communication_skills || 0), 0) / evaluations.length;
    const avgPunc = evaluations.reduce((sum, e) => sum + (e.punctuality || 0), 0) / evaluations.length;
    return [{ name: "Average", Technical: avgTech, Communication: avgComm, Punctuality: avgPunc }];
  };

  if (loading) return <div className="as-loading">Loading...</div>;
  if (error) return <div className="as-error">{error}</div>;

  return (
    <div className="as-root">
      <aside className="as-sidebar">
        <div className="as-logo">ILES</div>
        <nav style={{ display:'flex', flexDirection:'column', gap:8, marginTop:24 }}>
          {[
            { id:'students', label:'n Students & Logs' },
            { id:'grades', label:'n Assign Grades' },
            { id:'charts', label:'n Overview Chart' },
            ].map(tab => (
              <button
                key={tab.id}
                className='as-logout'
                onClick={() => setActiveTab(tab.id)}
                style={{
                  backgroundColor: activeTab === tab.id ? '#4A6FA5' : '#EDE7F6',
                  color: activeTab === tab.id ? '#fff' : '#2E4A7A',
                  marginBottom: 0,
                  
                }}
              >
                {tab.label}
              </button>
            ))}
        </nav>
        <button className="as-logout" style={{ marginTop:'auto' }} onClick={handleLogout}>Logout</button>
      </aside>
      {activeTab === 'students' && placements.map(p => { /* existing card */ })}
      {activeTab === 'grades' && placements.map(p => { /* grade form */ })}
      {activeTab === 'charts' && getChartData().length > 0 && (
        <div className='as-chart-box'>/* existing chart */</div>
      )}
      <main className='as-main'>
        <h1 className='as-title'>
          Welcome, {user?.username || user?.email?.split('@')[0] || "Academic Supervisor"}
        </h1>
        {gradeMsg && <div className='as-success'>{gradeMsg}</div>}
        {publishMsg && <div className='as-success'>{publishMsg}</div>}
        

        {placements.length === 0 && (
  <div className="as-empty">
    No students are currently assigned to you. Once the internship admin assigns students, they will appear here.
  </div>
)}
        {placements.map(p => {
          const stuLogs = logs.filter(l => l.placement === p.id);
          const stuGrades = grades.filter(g => g.placement === p.id);
          const hasGrade = stuGrades.length > 0;
          return (
            <div key={p.id} className="as-student-card">
              <h2 className="as-student-name">{p.student?.username || "Student"} - {p.company_name}</h2>
              <h3 className="as-section-hdr">Weekly Logs</h3>
              {placementLogs.length === 0 ? <p className="as-muted">No weekly logs submitted for this placement yet.</p> : placementLogs.map((log) => (
                <div key={log.id} className="as-log-row">
                  <span>Week {log.week}</span>
                  <span className={`as-badge as-badge-${String(log.status).toLowerCase()}`}>{log.status}</span>
                  <span>{log.description?.slice(0, 70)}{log.description?.length > 70 ? "..." : ""}</span>
                </div>
              ))}
              <h3 className='as-section-hdr'>Evaluation Scores</h3>
              {stuGrades.map(g => (
                <div key={g.id} className="as-scores-summary">
                  <p><strong>Final Score:</strong> {g.score}/100 ({g.grade_letter})</p>
                  <p><strong>Academic Score:</strong> {g.academic_score}</p>
                  <p><strong>Published:</strong> {g.published ? 'Yes' : 'No'}</p>
                  <p><strong>Remarks:</strong> {g.remarks}</p>
                  {!g.published && (
                    <button
                    className='as-grade-btn'
                    style={{ background: '#E8F5E9', marginTop: 8 }}
                    onClick={async () => {
                      try {
                        await publishGrade(g.id);
                        setPublishMsg(`Grade for ${p.student?.username} published!`);

                        const fresh = await getGrades();
                        setGrades(Array.isArray(fresh) ? fresh : fresh.results ?? []);
                        setTimeout(() => setPublishMsg(''), 3000);
                        } catch (err) {
                          setPublishMsg('Publish failed: ' + err.message);
                        }
                      }}
                      >
                        n Publish Grade to Student
                      </button>
        )}
                </div>
                ))
              }

              {!hasGrade && (
                <div className="as-grade-section">
                  <button className="as-open-grade" onClick={() => openGradeForm(p.id)}>+ Assign Final Grade</button>
                  {activePlacementId === p.id && (
                    <div className="as-grade-form">
                      <input
                        type="number"
                        name="academic_score"
                        placeholder="Academic score (0-100)"
                        value={gradeForm.academic_score}
                        onChange={handleGradeChange}
                        min="0"
                        max="100"
                        title="Enter the academic supervisor score between 0 and 100."
                      />
                      <textarea
                        name="remarks"
                        placeholder="Overall remarks"
                        value={gradeForm.remarks}
                        onChange={handleGradeChange}
                        title="Add a short comment explaining the student's performance."
                        rows="2"
                      />
                      <div className='as-grade-actions'>
                        <button onClick={() => handleGradeSubmit(p.id)}>Submit Grade</button>
                        <button onClick={() => setActivePlacementId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {getChartData().length > 0 && (
          <div className="as-chart-box">
            <h3>Evaluation Scores Overview (Average across all students)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Technical" fill="#1A73E8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Communication" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Punctuality" fill="#E65100" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
