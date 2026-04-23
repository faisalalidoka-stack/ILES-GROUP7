import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { getPlacements, updatePlacement } from "../services/api";

export default function AdminDashboard() {
  const [placements, setPlacements] = useState([]); // we start with an empty array

  useEffect(() => {
    // we add a catch here because if the backend returns 401 res.data will be empty
    getPlacements()
      .then(res => {
        if (res.data) setPlacements(res.data);
      })
      .catch(err => console.error("failed to fetch placements probably a 401", err));
  }, []);

  const handleActivate = (id) => {
    updatePlacement(id, { status: "Active" })
      .then(() => {
        // we update the local state so the button disappears immediately
        // this avoids needing a page refresh to see the change
        setPlacements(prev => prev.map(p => p.id === id ? { ...p, status: "Active" } : p));
      })
      .catch(err => console.error("failed to update placement", err));
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
          {/* we use p here instead of item so it matches your table rows */}
          {placements?.map((p) => (
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