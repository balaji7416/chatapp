import { CLIENT } from "../../../lib/events.js";
import {
  useChatStore,
  useCurrentConversation,
} from "../../../store/chatStore.js";
import { useSocketStore } from "../../../store/socketStore.js";
import { useState } from "react";
import ConversationItem from "../sidebar/ConversationItem.jsx";

function ChatHeader({ onChatInfoClick }) {
  const [openOptions, setOpenOptions] = useState(false);

  const currConversation = useCurrentConversation();
  const leaveConversation = useChatStore((state) => state.leaveConversation);
  const emit = useSocketStore((state) => state.emit);
  const isConnected = useSocketStore((state) => state.isConnected);
  if (!currConversation) return <div>choose a conversation</div>;

  const handleLeave = async() => {
    await leaveConversation(currConversation?.id);
    if(isConnected)
      emit(CLIENT.LEAVE_CHAT, { conversationId: currConversation?.id });
    setOpenOptions(false);
  }
  return (
    <div className="flex p-3 h-10 border-b">
      <h1 className="text-xl font-bold">{currConversation.name}</h1>
      <button className="flex-1" onClick={() => onChatInfoClick()}></button>
      <button
        className="relative"
        onClick={() => setOpenOptions((prev) => !prev)}
      >
        ***
      </button>
      {openOptions && (
        <div className="absolute top-10 right-10">
          <button
            onClick={handleLeave}
          >
            leave conversation
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatHeader;
