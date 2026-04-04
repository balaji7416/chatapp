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
    <div>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            value={username}
            placeholder="username"
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        )}
        <input
          type="text"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          value={password}
          placeholder="*******"
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {isLogin ? "Login" : "Register"}
        </button>
        <p>
          {isLogin ? "already have an account?" : "dont have an account?"}
          <button type="button" onClick={() => setIsLogin((prev) => !prev)}>
            {isLogin ? "register" : "login"}
          </button>
        </p>
      </form>
      <div>
        {error && !loading && <p>{error}</p>}
        {loading && <p>loading...</p>}
      </div>
    </div>
  );
}

export default AuthPage;
