import {
  useChatStore,
  useCurrentConversation,
} from "../../../store/chatStore.js";
import { useState } from "react";

function ChatHeader({ onChatInfoClick }) {
  const [openOptions, setOpenOptions] = useState(false);
  const currConversation = useCurrentConversation();
  const leaveConversation = useChatStore((state) => state.leaveConversation);
  if (!currConversation) return <div>choose a conversation</div>;

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
            onClick={() => {
              leaveConversation(currConversation?.id);
              setOpenOptions(false);
            }}
          >
            leave conversation
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatHeader;
