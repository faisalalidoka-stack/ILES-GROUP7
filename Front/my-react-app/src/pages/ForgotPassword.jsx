import { useState } from "react";
import { requestPasswordReset } from "../services/api";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      await requestPasswordReset({ email });
      setMessage("A reset link has been sent to your email. Check your inbox.");
      setEmail("");
    } catch (err) {
      setIsError(true);
      setMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-box">
        <h2 className="fp-title">Forgot Password</h2>
        <p className="fp-subtitle">Enter your email to receive a reset link.</p>
        <input
          className="fp-input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button
          className={`fp-btn ${loading ? "fp-btn-loading" : ""}`}
          onClick={handleSubmit}
          disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        {message && (
          <p className={`fp-msg ${isError ? "fp-msg-error" : "fp-msg-success"}`}>
            {message}
          </p>
        )}
        <div className="fp-back">
          <Link to="/">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
