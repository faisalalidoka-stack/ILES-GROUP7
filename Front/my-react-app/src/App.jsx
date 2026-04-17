import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import WorkplaceSupervisorDashboard from "./pages/WorkplaceSupervisorDashboard";
import AcademicSupervisorDashboard from "./pages/AcademicSupervisorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/workplace-supervisor" element={<WorkplaceSupervisorDashboard />} />
        <Route path="/academic-supervisor" element={<AcademicSupervisorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App; 
