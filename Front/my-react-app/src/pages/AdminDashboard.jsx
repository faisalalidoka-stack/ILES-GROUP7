import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { getPlacements, updatePlacement } from "../api";

export default function AdminDashboard() {
  const [placements, setPlacements] = useState([]);

  useEffect(() => {
    getPlacements().then(res => setPlacements(res.data));
  }, []);

  const handleActivate = (id) => {
    updatePlacement(id, { status: "Active" });
  };

  return (
    <div>
      <Navbar />
      <h2>Admin Dashboard</h2>
      <table>
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
          {placements.map(p => (
            <tr key={p.id}>
              <td>{p.student_name}</td>
              <td>{p.company}</td>
              <td>{p.status}</td>
              <td>{p.academic_supervisor}</td>
              <td>{p.workplace_supervisor}</td>
              <td>
                {p.status !== "Active" && (
                  <button onClick={() => handleActivate(p.id)}>
                    Set Active
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
