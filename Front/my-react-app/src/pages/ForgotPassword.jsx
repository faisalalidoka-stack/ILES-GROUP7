import { useState } from "react";
import { requestPasswordReset } from "../services/api"; //this is our new updated path
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); //this clear the previous messages

    try {
      await requestPasswordReset({ email });
      setMessage("A Reset Link has been sent to your email check");
      setEmail(""); //this claers the input if succsessful

    } catch (err) {
      setIsError(true);
      setMessage(err.message || "Something went wrong plaese try again");
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <p>Enter your email to receive a password reset link</p>
      <form onSubmit={handleSubmit}>
        <input type="email"
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required/>
        <button type="submit">Send Reset Link</button>
      </form>

      {message && (
        <p style={{ clor: isError ? 'red' : 'green', marginTop: '10px'}}>
          {message}
        </p>
      )}
      <div style={{ marginTop: '20px'}}>
        <Link to="/">Back to Login</Link>
      </div>

    </div>
  );
}