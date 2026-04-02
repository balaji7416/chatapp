import ChatHeader from "./ChatHeader.jsx";
import MessageList from "./MessageList.jsx";
import MessageInput from "./MessageInput.jsx";
import { useChatStore } from "../../../store/chatStore.js";
function ChatArea() {
  const currConversationId = useChatStore(
    (state) => state.currentConversationId,
  );
  return (
    <div className="flex-1 flex flex-col h-full gap-2">
      <ChatHeader />
      <MessageList />
      {currConversationId && <MessageInput />}
    </div>
  );
}

export default ChatArea;
