import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({
  children,
  adminOnly = false,
  farmerOnly = false,
}) {
  const location = useLocation();

  const {
    initializing,
    isAuthenticated,
    isAdmin,
    isFarmer,
  } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-6 text-center shadow-sm">
          <p className="font-semibold text-gray-700">
            Loading account...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (farmerOnly && !isFarmer) {
    return <Navigate to="/admin/farms" replace />;
  }

  return children;
}

export default ProtectedRoute;