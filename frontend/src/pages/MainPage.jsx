import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import { useAuthStore } from "../store/authStore";
import { useSocketStore } from "../store/socketStore.js";
import { useChatStore } from "../store/chatStore.js";

import Sidebar from "../components/sidebar/Sidebar.jsx";
import ChatArea from "./ChatPage.jsx";

function MainPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const connect = useSocketStore((state) => state.connect);
  const isSocketConnected = useSocketStore((state) => state.isConnected);
  const access_token = useAuthStore((store) => store.access_token);
  const chatChosen = useChatStore((state) => state.chatChosen);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  //if user token is refreshed, but socket is not reconnected
  useEffect(() => {
    if (user && access_token && !isSocketConnected) {
      console.log("connecting socket...");
      connect();
    }
  }, [user, access_token, isSocketConnected, connect]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile when chat is chosen, always visible on desktop */}
      <div
        className={clsx(`
        ${chatChosen ? "hidden lg:block" : "block w-full"}
        lg:w-100 lg:shrink-0
      `)}
      >
        <Sidebar />
      </div>

      {/* ChatArea - visible on desktop always, on mobile only when chat is chosen */}
      <div
        className={`
        ${chatChosen ? "block w-full" : "hidden lg:block"}
        lg:flex-1
      `}
      >
        <ChatArea />
      </div>
    </div>
  );
}

export default MainPage;
