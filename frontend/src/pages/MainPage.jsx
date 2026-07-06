import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import { useAuthStore } from "../store/authStore";
import { useSocketStore } from "../store/socketStore.js";
import { useToastStore } from "../store/toastStore.js";
import { useChatStore } from "../store/chatStore.js";
import { SERVER } from "../lib/events.js";

import Sidebar from "../components/sidebar/Sidebar.jsx";
import ChatArea from "../components/chat/ChatArea.jsx";

function MainPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const connect = useSocketStore((state) => state.connect);
  const isSocketConnected = useSocketStore((state) => state.isConnected);
  const access_token = useAuthStore((store) => store.access_token);
  const showInfo = useToastStore((state) => state.info);
  const on = useSocketStore((state) => state.on);
  const addMember = useChatStore((state) => state.addMember);
  const removeMember = useChatStore((state) => state.removeMember);
  const chatChosen = useChatStore((state) => state.chatChosen);
  const updateMemberLastRead = useChatStore((state) => state.updateMemberLastRead);

  //to track if socket is already connected
  // const hasConnected = useRef(false);
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!isSocketConnected) return;

    const cleanupJoin = on(SERVER.CHAT_JOINED, ({ data }) => {
      console.log("Chat joined event:", data);
      if (data?.message) showInfo(data.message);
      addMember(data.conversationId, data.user);
    });

    const cleanupLeft = on(SERVER.CHAT_LEFT, ({ data }) => {
      console.log("Chat left event:", data);
      if (data?.message) showInfo(data.message);
      removeMember(data.conversationId, data.user);
    });

    const cleanupRead = on(SERVER.MARK_MESSAGE_AS_READ, ({ data }) => {
      if (data?.conversationId && data?.user_id) {
        // last_read_at comes from NOW() on the server so it's always fresh
        // Fall back to current time on the client if for any reason it's missing
        const readAt = data.last_read_at || new Date().toISOString();
        updateMemberLastRead(data.conversationId, data.user_id, readAt);
      }
    });

    return () => {
      cleanupJoin();
      cleanupLeft();
      cleanupRead();
    };
  }, [isSocketConnected, on, showInfo, addMember, removeMember, updateMemberLastRead]);

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
