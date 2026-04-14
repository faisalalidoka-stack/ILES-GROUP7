// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import './Register.css';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    setLoading(true); setError(""); setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match."); setLoading(false); return;
    }
    try {
      const data = await forgotPassword({ email, newPassword, confirmPassword });
      if (!data.success) { setError(data.error || "Reset failed"); return; }
      setSuccess("Password reset! Redirecting to login...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          Enter your registered email and choose a new password.
        </p>
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
        <input type="email" placeholder="Registered Email"
          className="auth-input"
          onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="New Password (min 8 chars)"
          className="auth-input"
          onChange={(e) => setNewPassword(e.target.value)} />
        <input type="password" placeholder="Confirm New Password"
          className="auth-input"
          onChange={(e) => setConfirmPassword(e.target.value)} />
        <button className={'auth-btn ${loading ? "disabled" : ""}'}
          onClick={handleReset} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        <p className="auth-link">
          Remember your password? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;