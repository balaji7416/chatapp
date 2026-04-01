import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

import Sidebar from "./sidebar/Sidebar.jsx";
import ChatArea from "./chatarea/ChatArea.jsx";

function MainPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <div>
        <Sidebar />
        <h1>Home</h1>
        <h1>Hello {user.username}</h1>
        <button onClick={() => logout()}>Logout</button>
        <ChatArea />
      </div>
    </div>
  );
}

export default MainPage;
