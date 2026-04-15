import ChatHeader from "./ChatHeader.jsx";
import ChatInfo from "./ChatInfo.jsx";
import MessageList from "./MessageList.jsx";
import MessageInput from "./MessageInput.jsx";
import { useChatStore } from "../../../store/chatStore.js";

function ChatArea() {
  const view = useChatStore((state) => state.chatAreaView);
  const setView = useChatStore((state) => state.setChatAreaView);
  const currConversationId = useChatStore(
    (state) => state.currentConversationId,
  );

  return (
    <div className="flex-1 flex flex-col h-full gap-1">
      <ChatHeader
        onChatInfoClick={() => {
          setView("chatInfo");
          // setOptionsOpen(false);
        }}
        setView={setView}
      />
      <div className="flex-1 overflow-auto">
        {view === "chats" && <MessageList />}
      </div>

      {view === "chats" && currConversationId && <MessageInput />}
      {view === "chatInfo" && currConversationId && (
        <ChatInfo onClick={() => setView("chats")} />
      )}
    </div>
  );
}

export default ChatArea;
