import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Used to redirect user after login
import { loginUser, saveToken, saveUser } from "../services/api";

function Login() {
  //these are the state variables to store user input and ui status
  const [email, setEmail] = useState("");        //stores email
  const [password, setPassword] = useState("");  // stores password
  const [role, setRole] = useState("student");   //default role is student
  const [loading, setLoading] = useState(false); //shos loading state
  const [error, setError] = useState("");        //stores error messages

  const navigate = useNavigate(); //usedfor page navigation

  //centers the login box and gives a light background color to the page
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5"
  };

  //now styling for the login box
  const boxStyle = {
    background: "white",
    padding: "2rem",
    borderRadius: "12px",
    width: "350px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  };

  //then Styling for input fields
  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  };

  //styling for login button
  const buttonStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: loading ? "#aaa" : "#2c3e50", // grey when loading
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px"
  };

  //this is a function that runs when user clicks login
  const handleLogin = async () => {
    setLoading(true);   //show loading state
    setError("");       //clears previous errors

    try {
      //Sends login request to backend
      const data = await loginUser(email, password, role);

      //login fails then show error message
      if (!data.success){
        setError(data.error || "Login failed");
        return;
      }

      //saves token and user details in local storage
      saveToken(data.token);
      saveUser(data.user);

      // defines where each role should be redirected
      const roleRoutes = {
        STUDENT: '/student',
        WORKPLACE_SUPERVISOR: '/supervisor',
        ACADEMIC_SUPERVISOR: '/academic',
        INTERNSHIP_ADMIN: '/admin',
      };

      //gets the correct route based on the user role
      const destination = roleRoutes[data.user.role] || '/';

      // Redirects the user
      navigate(destination);
    }
    catch (err) {
      // Handles network or server issues
      setError(err.message || "An error occurred during login try again");
    } 
    finally {
      setLoading(false); //stop loading
    }
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <h2 style={{ textAlign: "center", color: "#2c3e50" }}>ILES System</h2>
        <p style={{ textAlign: "center", color: "#888" }}>
          Sign in to your account
        </p>

        {/* Show error message if login fails */}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        
        {/*the email input */}
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        
        {/* the Password input */}
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        
        {/*the role selection dropdown */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={inputStyle}
        >
          <option value="student">Student</option>
          <option value="workplace_supervisor">Workplace Supervisor</option>
          <option value="academic_supervisor">Academic Supervisor</option>
          <option value="admin">Admin</option>
        </select>
        
        {/*the login button */}
        <button
          onClick={handleLogin}
          disabled={loading} //disable button when loading
          style={buttonStyle}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

export default Login;