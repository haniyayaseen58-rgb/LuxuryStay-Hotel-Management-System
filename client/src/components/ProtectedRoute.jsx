import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user) {
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