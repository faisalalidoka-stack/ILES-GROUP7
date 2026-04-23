import { Navigate } from "react-router-dom";
import { getUser } from "../services/api";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getUser();

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check role if allowedRoles is provided
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's actual role
    const roleRoutes = {
      STUDENT: "/student",
      WORKPLACE_SUPERVISOR: "/supervisor",
      ACADEMIC_SUPERVISOR: "/academic",
      INTERNSHIP_ADMIN: "/admin",
    };
    const destination = roleRoutes[user.role] || "/";
    return <Navigate to={destination} replace />;
  }

  // Authorized – render the child component
  return children;
};

export default ProtectedRoute;