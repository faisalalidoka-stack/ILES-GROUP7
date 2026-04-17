import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { getPlacements, getWeeklyLogs, updateWeeklyLog } from "../api";

export default function WorkplaceSupervisorDashboard() {
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getPlacements().then(res => setPlacements(res.data));
    getWeeklyLogs().then(res => setLogs(res.data));
  }, []);

  const handleApprove = (id) => {
    updateWeeklyLog(id, { status: "Approved" });
  };

  const handleReject = (id) => {
    updateWeeklyLog(id, { status: "Rejected" });
  };

  return (
    <div>
      <Navbar />
      <h2>Workplace Supervisor Dashboard</h2>
      {placements.map(p => (
        <div key={p.id}>
          <h3>{p.student_name} — {p.company}</h3>
          {logs.filter(l => l.student === p.student).map(log => (
            <div key={log.id}>
              <p>{log.description}</p>
              <p>Supervisor Comment: {log.supervisor_comment}</p>
              <button onClick={() => handleApprove(log.id)}>Approve</button>
              <button onClick={() => handleReject(log.id)}>Reject</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}