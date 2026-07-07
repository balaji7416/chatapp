// pages/NotFoundPage.jsx
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="text-center">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-8xl md:text-9xl font-black text-base-content/5">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl md:text-7xl font-bold text-base-content/20">
              😕
            </span>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold mt-4">Page Not Found</h2>
        <p className="text-base-content/60 mt-2 max-w-sm">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
          <Link to="/" className="btn btn-primary gap-2">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
