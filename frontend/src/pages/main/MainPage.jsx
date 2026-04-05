import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import clsx from "clsx";

import { useAuthStore } from "../../store/authStore";
import { useSocketStore } from "../../store/socketStore.js";

import Sidebar from "./sidebar/Sidebar.jsx";
import ChatArea from "./chatarea/ChatArea.jsx";

function MainPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const connect = useSocketStore((state) => state.connect);
  const isSocketConnected = useSocketStore((state) => state.isConnected);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  //if user token is refreshed, but socket is not reconnected
  useEffect(() => {
    if (user && !isSocketConnected) {
      connect();
    }
  }, [user, isSocketConnected, connect]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatArea />
    </div>
  );
}

export default MainPage;
