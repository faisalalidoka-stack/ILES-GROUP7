import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logOut, getPlacements, getWeeklyLogs, getGrades, createGrade } from '../services/api';
import './AcademicSupervisorDashboard.css';

export default function AcademicSupervisorDashboard() {
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getUser();

  // Grade form state
  const [gradeForm, setGradeForm] = useState({ placement: '', score: '', remarks: '' });
  const [gradeMsg, setGradeMsg] = useState('');
  const [activePlacementId, setActivePlacementId] = useState(null);

  useEffect(() => {
    Promise.all([getPlacements(), getWeeklyLogs(), getGrades()])
      .then(([pData, lData, gData]) => {
        setPlacements(pData.results ?? pData);
        setLogs(lData.results ?? lData);
        setGrades(gData.results ?? gData);
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
      setGradeForm({ placement: '', score: '', remarks: '' });
      // Refresh grades list
      const data = await getGrades();
      setGrades(data.results ?? data);
      setTimeout(() => setGradeMsg(''), 3000);
    } catch (err) {
      setGradeMsg('Error: ' + (err.message || 'Submission failed'));
      console.error(err);
    }
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
                <div key={g.id} className='as-scores'>
                  <ScoreBar label='Technical' value={g.technical_skills} />
                  <ScoreBar label='Communication' value={g.communication_skills} />
                  <ScoreBar label='Punctuality' value={g.punctuality} />
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
                        <button onClick={handleGradeSubmit}>Submit Grade</button>
                        <button onClick={() => setActivePlacementId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
