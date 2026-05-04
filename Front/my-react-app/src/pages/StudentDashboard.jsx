import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getWeeklyLogs, 
  createWeeklyLog, 
  updateWeeklyLog, 
  logOut, 
  getUser,
  getPlacements,
  getGrades
} from "../services/api";
import "./StudentDashboard.css";

const emptyForm = {
  week: "",
  description: "",
  hours: "",
  challenges: "",
  skills: "",
  attachment: null,
  attachmentName: "",
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [logs, setLogs] = useState([]);
  const [placementId, setPlacementId] = useState(null); 
  const [grade, setGrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchLogs();
    fetchPlacement();
    fetchGrade();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getWeeklyLogs();
      setLogs(data);
    } catch (err) {
      setError("Failed to load logs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacement = async () => {
    try {
      const data = await getPlacements();
      if (Array.isArray(data) && data.length > 0) {
        setPlacementId(data[0].id);
      } else if (data && data.id) {
        setPlacementId(data.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGrade = async () => {
    try {
      const data = await getGrades();
      const gradesArray = Array.isArray(data) ? data : data.results ?? [];
      if (gradesArray.length > 0) {
        setGrade(gradesArray[0]);
      }
    } catch (err) {
      console.error("Failed to fetch grade:", err);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.week || isNaN(form.week)) newErrors.week = "Week is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    if (!form.hours || isNaN(form.hours)) newErrors.hours = "Hours is required.";
    if (!form.challenges.trim()) newErrors.challenges = "Challenges field is required.";
    if (!form.skills.trim()) newErrors.skills = "Skills field is required.";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment" && files.length > 0) {
      setForm((prev) => ({
        ...prev,
        attachment: files[0],
        attachmentName: files[0].name,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const logData = {
      week: Number(form.week),
      description: form.description.trim(),
      hours: Number(form.hours),
      challenges: form.challenges.trim(),
      skills: form.skills.trim(),
      placement: placementId,
      attachment: form.attachment,
    };

    try {
      if (editIndex !== null && editId !== null) {
        await updateWeeklyLog(editId, logData);
        setSuccessMsg("Log updated successfully!");
      } else {
        await createWeeklyLog(logData);
        setSuccessMsg("Log submitted successfully!");
      }
      fetchLogs();
      setForm(emptyForm);
      setEditIndex(null);
      setEditId(null);
      setShowForm(false);
      setErrors({});
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrors({ submit: `Request failed` });
      console.error(err);
    }
  };

  const handleSubmitForReview = async (logId) => {
    try {
      await updateWeeklyLog(logId, { status: 'Submitted' });
      setSuccessMsg('Log submitted for supervisor review!');
      fetchLogs();
    } catch (err) {
      setError('Failed to submit log: ' + (err.message || 'Please try again.'));
      console.error(err);
    }
  };

  const handleEdit = (index, log) => {
    setForm({
      week: log.week || "",
      description: log.description,
      hours: String(log.hours),
      challenges: log.challenges,
      skills: log.skills || "",
      attachment: null,
      attachmentName: log.attachmentName || "",
    });
    setEditIndex(index);
    setEditId(log.id);
    setShowForm(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditIndex(null);
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleLogout = () => {
    logOut();
    navigate("/");
  };

  const GradeCard = ({ grade }) => {
    if (!grade || !grade.published) return null;
    const b = grade.breakdown;
    const gradeColors = {
      A: '#2E7D32',
      B: '#1A73E8',
      C: '#E65100',
      D: '#6A1B9A',
      F: '#C62828',
    };
    const color = gradeColors[grade.grade_letter] || '#495057';

    return (
      <section className="sd-grade-card">
        <h2 className="sd-section-title">My Final Grade</h2>
        <div className="sd-grade-display">
          <span className="sd-grade-letter" style={{ color }}>
            {grade.grade_letter}
          </span>
          <span className="sd-grade-score">{grade.score} / 100</span>
        </div>
        {b && (
          <div className="sd-grade-breakdown">
            <h4>Score Breakdown</h4>
            <div className="sd-breakdown-row">
              <span>Technical Skills ({b.technical_skills}/10 × 4)</span>
              <span className="sd-breakdown-val">{b.technical_weighted} pts</span>
            </div>
            <div className="sd-breakdown-row">
              <span>Communication ({b.communication_skills}/10 × 3)</span>
              <span className="sd-breakdown-val">{b.communication_weighted} pts</span>
            </div>
            <div className="sd-breakdown-row">
              <span>Punctuality ({b.punctuality}/10 × 3)</span>
              <span className="sd-breakdown-val">{b.punctuality_weighted} pts</span>
            </div>
            <div className="sd-breakdown-total">
              <span>Total</span>
              <span>{b.total} / 100</span>
            </div>
          </div>
        )}
        {grade.remarks && (
          <div className="sd-grade-remarks">
            <strong>Remarks:</strong> {grade.remarks}
          </div>
        )}
      </section>
    );
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="sd-root">
      <aside className="sd-sidebar">
        <div className="sd-logo">
          <span className="sd-logo-icon">🎓</span>
          <span className="sd-logo-text">ILES</span>
        </div>
        <nav className="sd-nav">
          <a href="#" className="sd-nav-link active">📋 My Logs</a>
          <a href="#" className="sd-nav-link">👤 Profile</a>
          <a href="#" className="sd-nav-link">📊 Reports</a>
          <a href="#" className="sd-nav-link">🔔 Notifications</a>
        </nav>
        <div className="sd-logout-wrapper">
           <button className="sd-logout-btn" onClick={handleLogout}>
             ↩ Logout
           </button>
        </div>
      </aside>

      <main className="sd-main">
        <header className="sd-header">
          <div>
            <h1 className="sd-welcome">Welcome back, {user?.email || "Student"} 👋</h1>
            <p className="sd-subtitle">Internship Logging & Evaluation System</p>
          </div>
          <button
            className="sd-add-btn"
            onClick={() => { setShowForm(true); setEditIndex(null); setEditId(null); setForm(emptyForm); }}
          >
            + New Log
          </button>
        </header>

        {successMsg && <div className="sd-success">{successMsg}</div>}
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}

        {showForm && (
          <section className="sd-form-card">
            <h2 className="sd-form-title">
              {editIndex !== null ? "✏️ Edit Internship Log" : "📝 Submit Internship Log"}
            </h2>

            {errors.submit && <p className="sd-error-banner">{errors.submit}</p>}

            <div className="sd-form-grid">
              <div className="sd-field">
                <label className="sd-label">Week Number *</label>
                <input
                  type="number"
                  name="week"
                  value={form.week}
                  onChange={handleChange}
                  className={`sd-input ${errors.week ? "sd-input-err" : ""}`}
                />
                {errors.week && <span className="sd-err-text">{errors.week}</span>}
              </div>

              <div className="sd-field">
                <label className="sd-label">Hours Worked *</label>
                <input
                  type="number"
                  name="hours"
                  value={form.hours}
                  onChange={handleChange}
                  className={`sd-input ${errors.hours ? "sd-input-err" : ""}`}
                />
                {errors.hours && <span className="sd-err-text">{errors.hours}</span>}
              </div>

              <div className="sd-field sd-field-full">
                <label className="sd-label">Description of Work *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className={`sd-textarea ${errors.description ? "sd-input-err" : ""}`}
                />
                {errors.description && <span className="sd-err-text">{errors.description}</span>}
              </div>

              <div className="sd-field sd-field-full">
                <label className="sd-label">Challenges Faced *</label>
                <textarea
                  name="challenges"
                  value={form.challenges}
                  onChange={handleChange}
                  rows={3}
                  className={`sd-textarea ${errors.challenges ? "sd-input-err" : ""}`}
                />
                {errors.challenges && <span className="sd-err-text">{errors.challenges}</span>}
              </div>

              <div className="sd-field sd-field-full">
                <label className="sd-label">Skills Learned / Used *</label>
                <textarea
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  rows={2}
                  className={`sd-textarea ${errors.skills ? "sd-input-err" : ""}`}
                />
                {errors.skills && <span className="sd-err-text">{errors.skills}</span>}
              </div>

              <div className="sd-field sd-field-full">
                <label className="sd-label">Attachment (optional)</label>
                <label className="sd-file-label">
                  📎 {form.attachmentName ? form.attachmentName : "Click to upload file"}
                  <input
                    type="file"
                    name="attachment"
                    onChange={handleChange}
                    className="sd-file-input"
                  />
                </label>
              </div>
            </div>

            <div className="sd-form-actions">
              <button className="sd-submit-btn" onClick={handleSubmit}>
                {editIndex !== null ? "Update Log" : "Submit Log"}
              </button>
              <button className="sd-cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </section>
        )}

        {!loading && !error && (
          <section className="sd-table-section">
            <h2 className="sd-section-title">My Internship Logs</h2>
            <div className="sd-table-wrapper">
              <table className="sd-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id || i}>
                      <td style={{ maxWidth: '100px' }}>{log.week}</td>
                      <td>{log.hours}h</td>
                      <td>
                        <span className={`sd-status sd-status-${(log.status || "pending").toLowerCase()}`}>
                          {log.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        <button className="sd-edit-btn" onClick={() => handleEdit(i, log)}>✏️ Edit</button>
                        {log.status === 'Draft' && (
                          <button 
                            className="sd-submit-btn" 
                            onClick={() => handleSubmitForReview(log.id)}
                            style={{ marginLeft: '8px' }}
                          >
                            📤 Submit
                          </button>
                        )}
                        {log.status === 'Rejected' && log.supervisor_comment && (
                          <div className="sd-feedback" style={{ marginTop: '6px' }}>
                            <strong>Feedback:</strong> {log.supervisor_comment}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {grade && grade.published && <GradeCard grade={grade} />}
      </main>
    </div>
  );
}