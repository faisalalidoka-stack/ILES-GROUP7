import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import WorkplaceSupervisorDashboard from "./pages/WorkplaceSupervisorDashboard";
import AcademicSupervisorDashboard from "./pages/AcademicSupervisorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/supervisor" element={<WorkplaceSupervisorDashboard />} />
        <Route path="/academic" element={<AcademicSupervisorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App; 
