import { Navigate } from "react-router-dom";

// Reads the JWT payload (without verifying it; the backend does that)
// so an expired or malformed token sends the user back to sign in.
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== allowedRole) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "staff") {
      return <Navigate to="/staff" replace />;
    }

    if (user.role === "guest") {
      return <Navigate to="/guest" replace />;
    }

    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default ProtectedRoute;
