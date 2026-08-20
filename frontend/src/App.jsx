import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import FarmDetail from "./pages/FarmDetail";
import Farms from "./pages/Farms";
import Login from "./pages/Login";
import Predictions from "./pages/Predictions";
import Recommendations from "./pages/Recommendations";
import Register from "./pages/Register";
import Users from "./pages/Users";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/farms" element={<ProtectedRoute><Farms /></ProtectedRoute>} />
      <Route path="/farms/:id" element={<ProtectedRoute><FarmDetail /></ProtectedRoute>} />
      <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={["admin", "gov_official"]}>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}
