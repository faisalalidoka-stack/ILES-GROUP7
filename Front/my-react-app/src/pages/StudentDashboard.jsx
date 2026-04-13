import { useState } from "react";
import "./StudentDashboard.css";

const initialLogs = [];

export default function StudentDashboard() {
  const [logs, setLogs] = useState(initialLogs);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const emptyForm = {
    date: "",
    description: "",
    hours: "",
    challenges: "",
    attachment: null,
    attachmentName: "",
  };

  const [form, setForm] = useState(emptyForm);

  const validate = () => {
    const newErrors = {};
    if (!form.date) newErrors.date = "Date is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    if (!form.hours || isNaN(form.hours) || Number(form.hours) <= 0 || Number(form.hours) > 24)
      newErrors.hours = "Enter valid hours (1–24).";
    if (!form.challenges.trim()) newErrors.challenges = "Challenges field is required.";

    const duplicate = logs.some((log, i) => {
      if (editIndex !== null && i === editIndex) return false;
      return (
        log.date === form.date &&
        log.description.toLowerCase().trim() === form.description.toLowerCase().trim()
      );
    });
    if (duplicate) newErrors.duplicate = "A log with this date and description already exists.";

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
    setErrors((prev) => ({ ...prev, [name]: "", duplicate: "" }));
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newLog = {
      date: form.date,
      description: form.description.trim(),
      hours: Number(form.hours),
      challenges: form.challenges.trim(),
      attachmentName: form.attachmentName || "—",
      status: "Pending",
    };

    if (editIndex !== null) {
      const updated = [...logs];
      updated[editIndex] = newLog;
      setLogs(updated);
      setSuccessMsg("Log updated successfully!");
    } else {
      setLogs((prev) => [newLog, ...prev]);
      setSuccessMsg("Log submitted successfully!");
    }

    setForm(emptyForm);
    setEditIndex(null);
    setShowForm(false);
    setErrors({});
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleEdit = (index) => {
    const log = logs[index];
    setForm({
      date: log.date,
      description: log.description,
      hours: String(log.hours),
      challenges: log.challenges,
      attachment: null,
      attachmentName: log.attachmentName !== "—" ? log.attachmentName : "",
    });
    setEditIndex(index);
    setShowForm(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditIndex(null);
    setShowForm(false);
    setErrors({});
  };

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
        <button className="sd-logout-btn">↩ Logout</button>
      </aside>

      <main className="sd-main">
        <header className="sd-header">
          <div>
            <h1 className="sd-welcome">Welcome back, Student 👋</h1>
            <p className="sd-subtitle">Internship Logging &amp; Evaluation System</p>
          </div>
          <button
            className="sd-add-btn"
            onClick={() => { setShowForm(true); setEditIndex(null); setForm(emptyForm); }}
          >
            + New Log
          </button>
        </header>

        {successMsg && <div className="sd-success">{successMsg}</div>}

        {showForm && (
          <section className="sd-form-card">
            <h2 className="sd-form-title">
              {editIndex !== null ? "✏️ Edit Internship Log" : "📝 Submit Internship Log"}
            </h2>

            {errors.duplicate && <p className="sd-error-banner">{errors.duplicate}</p>}

            <div className="sd-form-grid">
              <div className="sd-field">
                <label className="sd-label">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`sd-input ${errors.date ? "sd-input-err" : ""}`}
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.date && <span className="sd-err-text">{errors.date}</span>}
              </div>

              <div className="sd-field">
                <label className="sd-label">Hours Worked *</label>
                <input
                  type="number"
                  name="hours"
                  value={form.hours}
                  onChange={handleChange}
                  placeholder="e.g. 8"
                  min="1"
                  max="24"
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
                  placeholder="Describe what you did during the internship today..."
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
                  placeholder="What challenges did you face? What did you learn from them?"
                  rows={3}
                  className={`sd-textarea ${errors.challenges ? "sd-input-err" : ""}`}
                />
                {errors.challenges && <span className="sd-err-text">{errors.challenges}</span>}
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
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
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
            <div className="sd-empty">
              <p>📂 No logs yet. Click <strong>+ New Log</strong> to get started!</p>
            </div>
          ) : (
            <div className="sd-table-wrapper">
              <table className="sd-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Hours</th>
                    <th>Challenges</th>
                    <th>Attachment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} className={i % 2 === 0 ? "sd-row-even" : ""}>
                      <td>{i + 1}</td>
                      <td>{log.date}</td>
                      <td className="sd-td-desc">{log.description}</td>
                      <td>{log.hours}h</td>
                      <td className="sd-td-desc">{log.challenges}</td>
                      <td>
                        {log.attachmentName !== "—" ? (
                          <span className="sd-attach-tag">📎 {log.attachmentName}</span>
                        ) : "—"}
                      </td>
                      <td>
                        <span className={`sd-status sd-status-${log.status.toLowerCase()}`}>
                          {log.status}
                        </span>
                      </td>
                      <td>
                        <button className="sd-edit-btn" onClick={() => handleEdit(i)}>
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}