import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ userName, userRole, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">ILES</span>
        <span className="navbar-tagline">Internship Logging & Evaluation</span>
      </div>

      <div className="navbar-user">
        <div className="navbar-avatar">
          {userName ? userName.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="navbar-info">
          <span className="navbar-name">{userName || "User"}</span>
          <span className="navbar-role">{userRole || "Role"}</span>
        </div>
        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};