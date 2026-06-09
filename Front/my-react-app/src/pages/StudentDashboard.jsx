import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getWeeklyLogs,
  createWeeklyLog,
  updateWeeklyLog,
  logOut,
  getUser,
  getPlacements,
  getGrades,
  getNotifications,
  markNotificationRead,
  updateProfile,
  saveUser,
  getProfile,
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
  const displayName = user?.username || user?.email?.split("@")[0] || "Student";

  const [logs, setLogs] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [grade, setGrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [activeTab, setActiveTab] = useState("logs"); // 'logs' | 'profile' | 'reports'
  const [profileForm, setProfileForm] = useState({ username: user?.username || "", profile_picture: null });
  const [profileMsg, setProfileMsg] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [expandedLog, setExpandedLog] = useState(null);


  useEffect(() => {
    fetchDashboardData();
    getNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  //runs once when the page loads
  //if login takes more than 4 seconds, the button text changes to let the user know it's not frozen — it's just the server starting up

  const unread = notifications.filter((n) => !n.is_read).length;

  // FIX: Removed duplicate handleNotifClick — keeping single definition here
  const handleNotifClick = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  // FIX: Renamed fetchLogs → fetchDashboardData to match all call sites
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [logData, placementData, gradeData] = await Promise.all([
        getWeeklyLogs(),
        getPlacements(),
        getGrades(),
      ]);
      setLogs(Array.isArray(logData) ? logData : logData.results ?? []);
      const placementsArray = Array.isArray(placementData) ? placementData : placementData.results ?? [];
      setPlacement(placementsArray[0] || null);
      const gradesArray = Array.isArray(gradeData) ? gradeData : gradeData.results ?? [];
      setGrade(gradesArray[0] || null);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === "profile") {
      try {
        const data = await getProfile(); // GET /profile/
        // Pre-fill the form with saved username
        setProfileForm({ username: data.username, profile_picture: null });
        // Store the existing picture URL for preview
        setProfilePicUrl(data.profile_picture || "");
      } catch (err) {
        console.error("Could not load profile:", err);
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.week || isNaN(form.week) || Number(form.week) < 1)
      newErrors.week = "Week number must be 1 or above.";
    if (!form.description.trim())
      newErrors.description = "Describe the work you completed.";
    if (!form.hours || isNaN(form.hours) || Number(form.hours) < 1)
      newErrors.hours = "Enter hours worked as a positive number.";
    if (!form.challenges.trim())
      newErrors.challenges = "Write at least one challenge or write 'None'.";
    if (!form.skills.trim())
      newErrors.skills = "Write at least one skill learned or used.";
    if (!placement?.id)
      newErrors.submit = "No internship placement is assigned to your account yet.";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment" && files.length > 0) {
      setForm((prev) => ({ ...prev, attachment: files[0], attachmentName: files[0].name }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "", submit: "" }));
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Ensure placement exists and convert its id to a number (backend expects integer)
    if (!placement || !placement.id) {
      setErrors({ submit: "No active placement found. Please contact your administrator." });
      return;
    }

    const logData = {
      week: Number(form.week),
      description: form.description.trim(),
      hours: Number(form.hours),
      challenges: form.challenges.trim(),
      skills: form.skills.trim(),
      placement: Number(placement.id),   // ✅ FIX: convert to number
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
      await fetchLogs();
      setForm(emptyForm);
      setEditIndex(null);
      setEditId(null);
      setShowForm(false);
      setErrors({});
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrors({ submit: err.message || "Request failed. Please check the form and try again." });
    }
  };

  const handleSubmitForReview = async (logId) => {
    try {
      await updateWeeklyLog(logId, { status: "Submitted" });
      setSuccessMsg("Log submitted for supervisor review!");
      fetchLogs();
    } catch (err) {
      setError("Failed to submit log: " + (err.message || "Please try again."));
    }
  };

  const handleEdit = (index, log) => {
    setForm({
      week: log.week || "",
      description: log.description || "",
      hours: String(log.hours || ""),
      challenges: log.challenges || "",
      skills: log.skills || "",
      attachment: null,
      attachmentName: log.attachmentName || "",
    });
    setEditIndex(index);
    setEditId(log.id);
    setShowForm(true);
    setActiveTab("logs");
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

  const logSummary = {
    total: logs.length,
    submitted: logs.filter((log) => log.status === "Submitted").length,
    approved: logs.filter((log) => log.status === "Approved").length,
    rejected: logs.filter((log) => log.status === "Rejected").length,
    draft: logs.filter((log) => log.status === "Draft").length,
  };

  const GradeCard = ({ grade }) => {
    if (!grade || !grade.published)
      return <p className="sd-empty">Final grade has not yet been published.</p>;
    const color =
      { A: "#2E7D32", B: "#1A73E8", C: "#E65100", D: "#6A1B9A", F: "#C62828" }[grade.grade_letter] ||
      "#495057";
    return (
      <section className="sd-grade-card">
        <h2 className="sd-section-title">My Final Grade</h2>
        <div className="sd-grade-display">
          <span className="sd-grade-letter" style={{ color }}>{grade.grade_letter}</span>
          <span className="sd-grade-score">{grade.score} / 100</span>
        </div>
        {grade.remarks && (
          <div className="sd-grade-remarks">
            <strong>Remarks:</strong> {grade.remarks}
          </div>
        )}
      </section>
    );
  };

  // Moved logs.map() inside <tbody> where it belongs, completed expandable row,
  // and removed the misplaced block that was sitting outside the function body.
  const renderLogs = () => (
    <>
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
                min="1"
                value={form.week}
                title="Enter the internship week number, for example 1, 2, or 3."
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
                min="1"
                value={form.hours}
                title="Enter total hours worked this week as a positive number."
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
                title="Briefly explain the work or tasks completed during the week."
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
                title="Write challenges faced this week. If none, write 'None'."
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
                title="Write skills learned or used during the week."
                onChange={handleChange}
                rows={2}
                className={`sd-textarea ${errors.skills ? "sd-input-err" : ""}`}
              />
              {errors.skills && <span className="sd-err-text">{errors.skills}</span>}
            </div>
            <div className="sd-field sd-field-full">
              <label className="sd-label">Attachment (optional)</label>
              <label
                className="sd-file-label"
                title="Upload optional evidence such as an image, PDF, or document."
              >
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

      <section className="sd-table-section">
        <h2 className="sd-section-title">My Internship Logs</h2>
        {logs.length === 0 ? (
          <p className="sd-empty">
            No logs have been created yet. Use the button above to submit your first weekly log.
          </p>
        ) : (
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
                {/* FIX: logs.map() moved inside <tbody> where it belongs */}
                {logs.map((log, i) => (
                  <>
                    {/* Main row */}
                    <tr key={log.id || i}>
                      <td>{log.week}</td>
                      <td>{log.hours}h</td>
                      <td>
                        <span
                          className={`sd-status sd-status-${(log.status || "pending").toLowerCase()}`}
                        >
                          {log.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        {/* Edit button */}
                        <button className="sd-edit-btn" onClick={() => handleEdit(i, log)}>
                          Edit
                        </button>
                        {/* View / Hide toggle */}
                        <button
                          className="sd-edit-btn"
                          style={{ marginLeft: 6 }}
                          onClick={() =>
                            setExpandedLog(expandedLog === log.id ? null : log.id)
                          }
                        >
                          {expandedLog === log.id ? "Hide" : "View"}
                        </button>
                        {/* Submit — only for Draft logs */}
                        {log.status === "Draft" && (
                          <button
                            className="sd-submit-btn"
                            style={{ marginLeft: 8 }}
                            onClick={() => handleSubmitForReview(log.id)}
                          >
                            Submit
                          </button>
                        )}
                        {/* Supervisor feedback — only for Rejected logs */}
                        {log.status === "Rejected" && log.supervisor_comment && (
                          <div className="sd-feedback" style={{ marginTop: 6 }}>
                            <strong>Feedback:</strong> {log.supervisor_comment}
                          </div>
                        )}
                      </td>
                    </tr>
                    {/* Completed the expandable detail row that was truncated */}
                    {expandedLog === log.id && (
                      <tr key={`${log.id || i}-detail`}>
                        <td colSpan={4}>
                          <div className="sd-log-detail">
                            <p><strong>Description:</strong> {log.description || "—"}</p>
                            <p><strong>Challenges:</strong> {log.challenges || "—"}</p>
                            <p><strong>Skills:</strong> {log.skills || "—"}</p>
                            {log.attachment && (
                              <p>
                                <strong>Attachment:</strong>{" "}
                                <a href={log.attachment} target="_blank" rel="noreferrer">
                                  View file
                                </a>
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );

  const renderProfile = () => (
    <section className="sd-info-card">
      <h2 className="sd-section-title">My Profile</h2>
      <div className="sd-info-grid">
        <p><strong>Username:</strong> {user?.username || "Not set"}</p>
        <p><strong>Email:</strong> {user?.email || "Not set"}</p>
        <p><strong>Role:</strong> {user?.role || "Student"}</p>
        <p><strong>Company:</strong> {placement?.company_name || "No placement assigned"}</p>
        <p><strong>Workplace Supervisor:</strong> {placement?.workplace_supervisor?.username || "Not assigned"}</p>
        <p><strong>Academic Supervisor:</strong> {placement?.academic_supervisor?.username || "Not assigned"}</p>
      </div>
    </section>
  );

  const renderReports = () => (
    <section className="sd-info-card">
      <h2 className="sd-section-title">Reports Summary</h2>
      <div className="sd-report-grid">
        <div><strong>{logSummary.total}</strong><span>Total Logs</span></div>
        <div><strong>{logSummary.draft}</strong><span>Draft</span></div>
        <div><strong>{logSummary.submitted}</strong><span>Submitted</span></div>
        <div><strong>{logSummary.approved}</strong><span>Approved</span></div>
        <div><strong>{logSummary.rejected}</strong><span>Rejected</span></div>
      </div>
      <GradeCard grade={grade} />
    </section>
  );

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
          {/* My Logs */}
          <button
            className={`sd-nav-link ${activeTab === "logs" ? "active" : ""}`}
            onClick={() => { handleTabChange("logs"); setShowForm(false); }}
          >
            My Logs
          </button>
          {/* Profile */}
          <button
            className={`sd-nav-link ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => handleTabChange("profile")}
          >
            Profile
          </button>
          {/* Reports */}
          <button
            className={`sd-nav-link ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => handleTabChange("reports")}
          >
            Reports
          </button>
          {/* Notifications */}
          <button className="sd-nav-link" onClick={() => setShowNotifs(!showNotifs)}>
            Notifications
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>
          {showNotifs && (
            <div className="notif-panel">
              {notifications.length === 0 && <p>No notifications</p>}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={n.is_read ? "notif-read" : "notif-unread"}
                  onClick={() => handleNotifClick(n.id)}
                >
                  {n.message}
                </div>
              ))}
            </div>
          )}
        </nav>
        <div className="sd-logout-wrapper">
          <button className="sd-logout-btn" onClick={handleLogout}>↩ Logout</button>
        </div>
      </aside>

      <main className="sd-main">
        {/* FIX: Moved welcome header out of <header> wrapping tab content */}
        <header className="sd-header">
          <div>
            <h1 className="sd-welcome">Welcome back, {user?.username || "Student"} 👋</h1>
            <p className="sd-subtitle">Internship Logging & Evaluation System</p>
          </div>
        </header>

        {successMsg && <div className="sd-success">{successMsg}</div>}
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}

        {/* FIX: Tab renders moved here; duplicate log form block in <main> removed */}
        {activeTab === "logs" && (
          <>
            <div className="sd-action-bar">
              <button
                className="sd-submit-btn"
                onClick={() => { setShowForm(true); setErrors({}); }}
              >
                + New Log
              </button>
            </div>
            {renderLogs()}
          </>
        )}

        {activeTab === "profile" && (
          <>
            {renderProfile()}
            <section className="sd-form-card">
              <h2 className="sd-form-title">Edit Profile</h2>
              {profilePicUrl && (
                <div className="sd-field">
                  <label className="sd-label">Current Picture</label>
                  <img
                    src={profilePicUrl}
                    alt="Profile"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #D6E4F7",
                    }}
                  />
                </div>
              )}
              {profileMsg && <p className="sd-success">{profileMsg}</p>}
              <div className="sd-field">
                <label className="sd-label">Username</label>
                <input
                  className="sd-input"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, username: e.target.value }))
                  }
                />
              </div>
              <div className="sd-field">
                <label className="sd-label">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, profile_picture: e.target.files[0] }))
                  }
                />
              </div>
              <button
                className="sd-submit-btn"
                onClick={async () => {
                  try {
                    const updated = await updateProfile(profileForm);
                    saveUser({
                      ...user,
                      username: updated.username,
                      profile_picture: updated.profile_picture,
                    });
                    setProfileMsg("Profile updated!");
                    setTimeout(() => setProfileMsg(""), 3000);
                  } catch (err) {
                    setProfileMsg("Update failed: " + err.message);
                  }
                }}
              >
                Save Changes
              </button>
            </section>
          </>
        )}

        {activeTab === "reports" && (
          <>
            {renderReports()}
            <section className="sd-form-card">
              <h2 className="sd-section-title">My Internship Report</h2>

              <h3>Placement Summary</h3>
              {placement ? (
                <table className="sd-table">
                  <tbody>
                    <tr><th>Company</th><td>{placement.company_name}</td></tr>
                    <tr><th>Start Date</th><td>{placement.start_date ?? "N/A"}</td></tr>
                    <tr><th>End Date</th><td>{placement.end_date ?? "N/A"}</td></tr>
                    <tr>
                      <th>Status</th>
                      <td>
                        <span
                          className={`sd-status sd-status-${(placement.status || "pending").toLowerCase()}`}
                        >
                          {placement.status}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>Workplace Supervisor</th>
                      <td>{placement.workplace_supervisor?.username ?? "Not assigned"}</td>
                    </tr>
                    <tr>
                      <th>Academic Supervisor</th>
                      <td>{placement.academic_supervisor?.username ?? "Not assigned"}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>No placement assigned yet.</p>
              )}

              <h3>Weekly Log Summary</h3>
              {logs.length === 0 ? (
                <p>No logs submitted yet.</p>
              ) : (
                <table className="sd-table">
                  <thead>
                    <tr><th>Week</th><th>Hours</th><th>Status</th><th>Skills</th></tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.week}</td>
                        <td>{log.hours}h</td>
                        <td>{log.status}</td>
                        <td>{log.skills || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><strong>Total</strong></td>
                      <td><strong>{logs.reduce((sum, l) => sum + (l.hours || 0), 0)}h</strong></td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              )}

              <h3>Final Grade</h3>
              {grade && grade.published ? (
                <p>
                  Grade: <strong>{grade.grade_letter}</strong> ({grade.score}/100)
                  {grade.remarks && <> — {grade.remarks}</>}
                </p>
              ) : (
                <p>Grade not yet published.</p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
