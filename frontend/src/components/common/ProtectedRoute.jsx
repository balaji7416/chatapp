import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore, useIsAuthenticated } from "../../store/authStore.js";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
