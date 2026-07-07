// layouts/ChatLayout.jsx
import { Outlet } from "react-router-dom";
import ChatHeader from "../components/chat/ChatHeader.jsx";

function ChatLayout() {
  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Header is ALWAYS visible for all chat routes */}
      <ChatHeader />

      {/* Content changes: ChatViewPage or ChatInfoPage */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

export default ChatLayout;
