import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logOut, getPlacements, getWeeklyLogs, getGrades, getEvaluations, createGrade } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AcademicSupervisorDashboard.css';

export default function AcademicSupervisorDashboard() {
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [grades, setGrades] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradeForm, setGradeForm] = useState({ placement: '', academic_score: '', remarks: '' });
  const [gradeMsg, setGradeMsg] = useState('');
  const [activePlacementId, setActivePlacementId] = useState(null);

  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    Promise.all([
      getPlacements(),
      getWeeklyLogs(),
      getGrades(),
      getEvaluations()
    ])
      .then(([pData, lData, gData, eData]) => {
        setPlacements(Array.isArray(pData) ? pData : pData.results ?? []);
        setLogs(Array.isArray(lData) ? lData : lData.results ?? []);
        setGrades(Array.isArray(gData) ? gData : gData.results ?? []);
        setEvaluations(Array.isArray(eData) ? eData : eData.results ?? []);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logOut();
    navigate('/');
  };

  const handleGradeChange = (e) => {
    setGradeForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGradeSubmit = async () => {
    try {
      await createGrade(gradeForm);
      setGradeMsg('Grade submitted successfully!');
      setActivePlacementId(null);
      setGradeForm({ placement: placementId, score: '', remarks: '' });
      const data = await getGrades();
      setGrades(data.results ?? data);
      setTimeout(() => setGradeMsg(''), 3000);
    } catch (err) {
      setGradeMsg('Error: ' + (err.message || 'Submission failed'));
      console.error(err);
    }
  };

  // Prepare chart data: average of evaluation scores
  const getChartData = () => {
    if (!evaluations.length) return [];
    const avgTech = evaluations.reduce((sum, e) => sum + (e.technical_skills || 0), 0) / evaluations.length;
    const avgComm = evaluations.reduce((sum, e) => sum + (e.communication_skills || 0), 0) / evaluations.length;
    const avgPunc = evaluations.reduce((sum, e) => sum + (e.punctuality || 0), 0) / evaluations.length;
    return [{ name: 'Average', Technical: avgTech, Communication: avgComm, Punctuality: avgPunc }];
  };

  const ScoreBar = ({ label, value, max = 10 }) => (
    <div className='as-score-row'>
      <span className='as-score-label'>{label}</span>
      <div className='as-bar-bg'>
        <div className='as-bar-fill' style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className='as-score-val'>{value}/{max}</span>
    </div>
  );

  if (loading) return <div className='as-loading'>Loading...</div>;
  if (error) return <div className='as-error'>{error}</div>;

  return (
    <div className='as-root'>
      <aside className='as-sidebar'>
        <div className='as-logo'>ILES</div>
        <button className='as-logout' onClick={handleLogout}>Logout</button>
      </aside>
      <main className='as-main'>
        <h1 className='as-title'>Academic Supervisor Dashboard</h1>
        {gradeMsg && <div className='as-success'>{gradeMsg}</div>}

        {placements.map(p => {
          const stuLogs = logs.filter(l => l.placement === p.id);
          const stuGrades = grades.filter(g => g.placement === p.id);
          const hasGrade = stuGrades.length > 0;
          return (
            <div key={p.id} className='as-student-card'>
              <h2 className='as-student-name'>{p.student?.username}</h2>
              <h3 className='as-section-hdr'>Weekly Logs</h3>
              {stuLogs.map(log => (
                <div key={log.id} className='as-log-row'>
                  <span>Week {log.week}</span>
                  <span className={`as-badge as-badge-${log.status.toLowerCase()}`}>
                    {log.status}
                  </span>
                  <span>{log.description?.slice(0, 60)}...</span>
                </div>
              ))}
              <h3 className='as-section-hdr'>Evaluation Scores</h3>
              {stuGrades.map(g => (
                <div key={g.id} className="as-scores-summary">
                  <p><strong>Final Score:</strong> {g.score}/100 ({g.grade_letter})</p>
                  <p><strong>Academic Score:</strong> {g.academic_score}</p>
                  <p><strong>Published:</strong> {g.published ? 'Yes' : 'No'}</p>
                  
                  <p><strong>Remarks:</strong> {g.remarks}</p>
                </div>
              ))}
              {!hasGrade && (
                <div className='as-grade-section'>
                  <button className='as-grade-btn' onClick={() => setActivePlacementId(p.id)}>
                    + Assign Final Grade
                  </button>
                  {activePlacementId === p.id && (
                    <div className='as-grade-form'>
                      <input
                        type='number'
                        name='score'
                        placeholder='Score (0-100)'
                        value={gradeForm.score}
                        onChange={handleGradeChange}
                        min='0'
                        max='100'
                      />
                      <textarea
                        name='remarks'
                        placeholder='Overall remarks'
                        value={gradeForm.remarks}
                        onChange={handleGradeChange}
                        rows='2'
                      />
                      <input type='hidden' name='placement' value={p.id} />
                      <div className='as-grade-actions'>
                        <button onClick={handleGradeSubmit(p.id)}>Submit Grade</button>
                        <button onClick={() => setActivePlacementId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Bar chart for average evaluation scores */}
        {getChartData().length > 0 && (
          <div className='as-chart-box'>
            <h3>Evaluation Scores Overview (Average across all students)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Technical" fill="#1A73E8" radius={[4,4,0,0]} />
                <Bar dataKey="Communication" fill="#2E7D32" radius={[4,4,0,0]} />
                <Bar dataKey="Punctuality" fill="#E65100" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
