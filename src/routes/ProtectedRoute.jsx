import { Navigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ Correct for Vite + ESModules

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const { role: routeRole } = useParams();

  if (!token) return <Navigate to="/login" replace />;

  try {
    const user = jwtDecode(token);
    const userRole = user?.role;

    if (userRole !== routeRole) {
      return <Navigate to={`/dashboard/${userRole}`} replace />;
    }

    return children;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
