// components/ChatArea.jsx
import { useChatStore } from "../store/chatStore.js";
import ChatHeader from "../components/chat/ChatHeader.jsx";
import ChatInfo from "./ChatInfoPage.jsx";
import MessageList from "../components/chat/MessageList.jsx";
import MessageInput from "../components/chat/MessageInput.jsx";
import { useNavigate } from "react-router-dom";

function ChatArea() {
  const currConversationId = useChatStore(
    (state) => state.currentConversationId,
  );
  const navigate = useNavigate();
  if (!currConversationId) {
    navigate("/", { replace: true });
  }

  return (
    <div className="flex-1 flex flex-col h-full gap-1">
      <div className="flex-1 overflow-auto">
        <MessageList />
      </div>
      <MessageInput />
    </div>
  );
}

export default ChatArea;
