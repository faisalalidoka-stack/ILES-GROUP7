import { useState } from "react"; // We are calling react hook (useState) to remember our user Input which is triggered by onChange event in the input field.
import { useNavigate } from "react-router-dom";
import { loginUser, saveToken, saveUser } from "../services/api";
import "./Login.css"; // Importing CSS for styling 
 
    


  //these are the state variables to store user input and ui status
function Login() {                               // component (login)
  const [email, setEmail] = useState("");        // State variable to store email,with email as a variable and setEmail as a function to update it,initially empty string
  const [password, setPassword] = useState("");  // State variable to store password
  const [role, setRole] = useState("student");   // State variable to store role with default value "student"
  const [loading, setLoading] = useState(false); // State variable to show loading state
  const [error, setError] = useState("");        // State variable to store error messages


  const navigate = useNavigate(); //usedfor page navigation


 //this is a function that runs when user clicks login and its the one that send data to backend and handles the response
  const handleLogin = async () => {
    setLoading(true);   //show loading state
    setError("");       //clears previous errors

    try {
      //Sends login request to backend
      const data = await loginUser({email, password, role});

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
    <div className="login-container">
      <div className="login-box">
        <h2>ILES System</h2>
        <p>
          Sign in to your account
          </p>

        {/* Show error message if login fails */}
        {error && <p className="error-message">{error}</p>}
        
        {/*the email input */}
        <input
          className = "input-field"
          type="text"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)} //e is an event object that reports what happens earlier in the input field, we use e.target.value to get the current value of the input and update the email state variable with setEmail function
          
        /> 

        <p>You are typing: {email}</p> 
        
        {/* the Password input */}
        <input 
          className = "input-field"
          type="password"
          placeholder="Password"
          value ={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        
        {/*the role selection dropdown */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className = "input-field"
        >
          <option value="STUDENT">Student</option>
          <option value="WORKPLACE_SUPERVISOR">Workplace Supervisor</option>
          <option value="ACADEMIC_SUPERVISOR">Academic Supervisor</option>
          <option value="INTERNSHIP_ADMIN">Admin</option>
        </select>
        
        {/*the login button */}
        <button
          onClick={handleLogin}
          disabled={loading} //disable button when loading
          className = "login-button"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

export default Login;