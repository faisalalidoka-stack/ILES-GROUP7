import { useState } from "react";
import { forgotPassword } from "../services/api"; //this is our new updated path
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ email, newPassword, confirmPassword });
      setMessage("Password reset successful!");
    } catch (err) {
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
      <Link to="/">Back to Login</Link>
    </div>
  );
}