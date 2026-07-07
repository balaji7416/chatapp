// pages/AuthPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAuthStore,
  useIsAuthLoading,
  useAuthError,
} from "../store/authStore.js";
import clsx from "clsx";

// ============================================
// FORM VALIDATION
// ============================================

const validateEmail = (email) => {
  return email.trim().length > 0;
};

const validatePassword = (password) => {
  return password.trim().length > 0;
};

function AuthPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const isLoading = useIsAuthLoading();
  const error = useAuthError();
  const clearError = useAuthStore((state) => state.clearError);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const isFormValid = isLogin
    ? validateEmail(formData.email) && validatePassword(formData.password)
    : formData.username.trim().length > 0 &&
      validateEmail(formData.email) &&
      validatePassword(formData.password);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    clearError();
  }, [isLogin, clearError]);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on input change
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!isFormValid) return;

    const { username, email, password } = formData;
    const data = isLogin ? { email, password } : { username, email, password };

    const result = isLogin ? await login(data) : await register(data);

    if (result?.success) {
      navigate("/", { replace: true });
    }
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setFormData({
      username: "",
      email: "",
      password: "",
    });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen w-full hero bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse w-full lg:gap-10">
        {/* Hero Text */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl lg:text-5xl font-bold">Chat App</h1>
          <p className="py-8 text-base-content/70">
            Connect with your friends and family in real-time
          </p>
        </div>

        {/* Auth Card */}
        <div className="card w-full lg:max-w-lg shadow-md bg-base-100">
          <form className="card-body" onSubmit={handleSubmit}>
            {/* Title */}
            <h2 className="card-title justify-center text-xl sm:text-2xl font-bold mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-center text-sm text-base-content/60 mb-4">
              {isLogin
                ? "Sign in to continue to your chats"
                : "Join the community and start chatting"}
            </p>

            {/* Username Field (Register only) */}
            {!isLogin && (
              <div className="form-control w-full space-y-2">
                <label className="label text-sm font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  disabled={isLoading}
                  className={clsx(
                    "input input-bordered w-full",
                    "transition-all duration-200",
                    "focus:input-primary",
                    "disabled:opacity-50",
                  )}
                />
              </div>
            )}

            {/* Email Field */}
            <div className="form-control w-full space-y-2">
              <label className="label text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isLoading}
                className={clsx(
                  "input input-bordered w-full",
                  "transition-all duration-200",
                  "focus:input-primary",
                  "disabled:opacity-50",
                  formData.email &&
                    !validateEmail(formData.email) &&
                    "input-error",
                )}
                required
              />
              {formData.email && !validateEmail(formData.email) && (
                <span className="text-xs text-error">
                  Please enter a valid email
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control w-full space-y-2">
              <label className="label text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
                className={clsx(
                  "input input-bordered w-full",
                  "transition-all duration-200",
                  "focus:input-primary",
                  "disabled:opacity-50",
                  formData.password &&
                    !validatePassword(formData.password) &&
                    "input-error",
                )}
                required
              />
              {formData.password && !validatePassword(formData.password) && (
                <span className="text-xs text-error">
                  Password must be at least 8 characters
                </span>
              )}
              {!isLogin &&
                formData.password &&
                validatePassword(formData.password) && (
                  <span className="text-xs text-success">
                    ✓ Password is valid
                  </span>
                )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-error text-sm mt-2">
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-control mt-4">
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="text-center mt-4">
              <span className="text-sm text-base-content/60">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-primary hover:underline ml-2 font-medium"
                disabled={isLoading}
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
