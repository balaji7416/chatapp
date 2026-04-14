import clsx from "clsx";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";

function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.isAuthLoading);
  const error = useAuthStore((state) => state.authError);
  const clearError = useAuthStore((state) => state.clearError);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin && (!email.trim() || !password.trim())) return;
    if (!isLogin && (!username.trim() || !email.trim() || !password.trim()))
      return;
    clearError();
    const data = isLogin ? { email, password } : { username, email, password };
    let res;
    if (isLogin) {
      res = await login(data);
    } else {
      res = await register(data);
    }

    if (res?.success) {
      let msg = isLogin ? "Login successful" : "Registration successful";
      alert(msg);
      navigate("/");
    }
  };

  return (
    <div
      className="min-h-screen w-full hero bg-base-200"
      style={{
        backgroundImage: "url()",
      }}
    >
      <div className="hero-content flex-col lg:flex-row-reverse w-full lg:gap-10">
        {/*hero text*/}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl lg:text-5xl font-bold">Chat App</h1>
          <p className="py-8">
            Connect with your friends and family in real-time
          </p>
        </div>

        {/*Auth Card*/}
        <div className="card w-full lg:max-w-lg shadow-md bg-base-100">
          <form className="card-body" onSubmit={handleSubmit}>
            <h2 className="card-title justify-center text-xl sm:text-2xl font-bold mb-2">
              {isLogin ? "Login" : "Register"}
            </h2>

            {!isLogin && (
              <div className="form-control w-full space-y-2">
                <label className="label">Username</label>
                <input
                  type="text"
                  value={username}
                  placeholder="username"
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className={clsx(
                    "input w-full rounded-md px-2 border-2 border-gray-200",
                    "transition-all duration-200 ease-in-out",
                    "focus:outline-none ",
                    "hover:border-gray-500 ",
                  )}
                />
              </div>
            )}

            <div className="form-control w-full space-y-2">
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={clsx(
                  "input validator",
                  " w-full rounded-md px-2 border-2 border-gray-200",
                  "transition-all duration-200 ease-in-out",
                  "focus:outline-none ",
                  "hover:border-gray-500 ",
                )}
              />
            </div>

            <div className="form-control w-full space-y-2">
              <label className="label">Password</label>
              <input
                type="password"
                required
                minLength={8}
                //pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                value={password}
                placeholder="*******"
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={clsx(
                  "input validator",
                  " w-full rounded-md px-2 border-2 border-gray-200",
                  "transition-all duration-200 ease-in-out",
                  "focus:outline-none ",
                  "hover:border-gray-400 ",
                )}
              />
              <p className="validator-hint">
                Must be more than 8 characters, including
                <br />
                At least one number
                <br />
                At least one lowercase letter
                <br />
                At least one uppercase letter
              </p>
            </div>

            {/*Error message*/}
            {error && !loading && (
              <div className="alert alert-error text-sm mt-2">
                <span>{error}</span>
              </div>
            )}

            <div className="form-control mt-4">
              <button
                type="submit"
                disabled={loading}
                full
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Register"
                )}
              </button>
            </div>

            <div className="text-center mt-4 font-semibold font-sans">
              {isLogin ? "already have an account? " : "dont have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin((prev) => !prev)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? "register" : "login"}
              </button>
            </div>
            {/* </fieldset> */}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
