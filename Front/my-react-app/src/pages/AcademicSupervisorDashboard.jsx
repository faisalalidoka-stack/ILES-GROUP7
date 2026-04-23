import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { getPlacements, getWeeklyLogs, getGrades } from "../services/api";

export default function AcademicSupervisorDashboard() {
  const [placements, setPlacements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    getPlacements().then(res => setPlacements(res.data));
    getWeeklyLogs().then(res => setLogs(res.data));
    getGrades().then(res => setGrades(res.data));
  }, []);

  return (
    <div>
       <Navbar /> 
      <h2>Academic Supervisor Dashboard</h2>
      {placements.map(p => (
        <div key={p.id}>
          <h3>{p.student_name}</h3>
          <h4>Weekly Logs</h4>
          {logs.filter(l => l.student === p.student).map(log => (
            <div key={log.id}>
              <p>{log.description}</p>
              <p>Status: {log.status}</p>
            </div>
          ))}
          <h4>Evaluation Scores</h4>
          {grades.filter(g => g.student === p.student).map(grade => (
            <div key={grade.id}>
              <p>Technical Skills: {grade.technical_skills}</p>
              <p>Communication: {grade.communication_skills}</p>
              <p>Punctuality: {grade.punctuality}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
