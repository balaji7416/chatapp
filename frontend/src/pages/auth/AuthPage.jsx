import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore.js";

function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const url = isLogin ? "/auth/login" : "/auth/register";
      const data = isLogin
        ? { email, password }
        : { username, email, password };
      const res = await api.post(url, data);
      const { access_token, refresh_token, user } = res.data.data;

      //store in zustand store
      login({ user, access_token, refresh_token });

      navigate("/");
      let msg = isLogin ? "Login successful" : "Registration successful";
      alert(msg);
    } catch (err) {
      setError(err.response.data.message);
      console.error(err);
    } finally {
      setLoading(false);
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
        {error && <p>{error}</p>}
        {loading && <p>loading...</p>}
      </div>
    </div>
  );
}

export default AuthPage;
