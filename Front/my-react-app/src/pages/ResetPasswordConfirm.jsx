//i have created this for the second function in the backend where we confirm 
//the password reset the forgot password only sends the reset email link
//his is where the actul chenging happens
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { confirmPasswordReset } from "../services/api";

export default function ResetPasswordConfirm() {
  //grabs the uid and token exactly as they are named in our Route
  const { uid, token } = useParams(); 
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      await confirmPasswordReset({ 
        uid, 
        token, 
        newPassword, 
        confirmPassword 
      });
      setIsError(false);
      setMessage("Password successfully reset! Redirecting to login");
      
      //redirects to login after 2 seconds
      setTimeout(() => {
        navigate("/"); 
      }, 2000);

    } catch (err) {
      setIsError(true);
      setMessage(err.message || "The reset link is invalid or has expired please try again");
    }
  };

  return (
    <div>
      <h2>Set New Password</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="password" 
          placeholder="New Password" 
          value={newPassword} 
          onChange={e => setNewPassword(e.target.value)} 
          required
          minLength="8"
        />
        <input 
          type="password" 
          placeholder="Confirm New Password" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          required
          minLength="8"
        />
        <button type="submit">Update Password</button>
      </form>
      
      {message && (
        <p style={{ color: isError ? 'red' : 'green', marginTop: '10px' }}>
          {message}
        </p>
      )}

      {isError && (
        <div style={{ marginTop: '15px' }}>
          <Link to="/forgot-password">Request a new reset link</Link>
        </div>
      )}
    </div>
  );
}