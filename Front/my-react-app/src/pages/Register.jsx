import { useState } from 'react'; // useState lets us store form data, loading state, errors, etc.
import { useNavigate, Link } from 'react-router-dom'; // useNavigate redirects user after success, Link is for linking to login page
import { registerUser } from '../services/api'; // connecting to api to send sign-up data to the backend
import './Register.css'; // has my design styles for this page

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  /* form is an object that holds all input field values. Initially empty except role defaults to student.
     setForm - the function to update form when user types
     loading - becomes 'true' while request is happening, disables the button.
     error - stores any error message from the backend.
     success - stores success message after registration.
     navigate - the function to go to another page (e.g., login) */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  /* this is a helper function to handle input changes. Every time user types it runs.
     e.target.name is the name attribute of the input (like "username").
     We create a new object, copy all existing form data, then update the one field that changed.
     This is the standard way to update an object in React state. */

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    setSuccess(""); // When user clicks "Sign Up", this runs. First, set loading to true (show disabled button) and clear any prev success/error messages.

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    } // Check if password and confirm password match. If not, show error, stop loading, exit early – do not send to backend.

    try {
      const data = await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
      }); // Send the form data to backend using registerUser from api.js. We await the response because we need to know if it was successful before updating the UI.

      if (!data.success) {
        setError(data.errors?.email?.[0] || data.errors?.username?.[0] || "Registration failed");
        return;
      } // If the backend returns "success: false", there was an error (e.g., email already exists). Show the first error message from errors.email or errors.username, otherwise a generic message.

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    } // If all is well, show success message. After 1.5s, redirect to login page (/). If network error happens, show error message. Finally turn off loading (so button becomes enabled again).
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the ILES System</p>

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <input
          name="username"
          placeholder="Username"
          className="auth-input"
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="auth-input"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="auth-input"
          onChange={handleChange}
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          className="auth-input"
          onChange={handleChange}
        />

        <select name="role" value={form.role} className="auth-input" onChange={handleChange}>
          <option value="STUDENT">Student</option>
          <option value="WORKPLACE_SUPERVISOR">Workplace Supervisor</option>
          <option value="ACADEMIC_SUPERVISOR">Academic Supervisor</option>
          <option value="INTERNSHIP_ADMIN">Internship Admin</option>
        </select>

        <button
          className={`auth-btn ${loading ? "disabled" : ""}`}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;