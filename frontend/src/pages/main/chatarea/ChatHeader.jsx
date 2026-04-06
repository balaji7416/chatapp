import { useCurrentConversation } from "../../../store/chatStore.js";

function ChatHeader({ onChatInfoClick }) {
  const currConversation = useCurrentConversation();
  if (!currConversation) return <div>choose a conversation</div>;
  return (
    <div className="flex p-3 h-10 border-b">
      <h1 className="text-xl font-bold">{currConversation.name}</h1>
      <button className="flex-1" onClick={() => onChatInfoClick()}></button>
      <span>***</span>
    </div>
  );
}

export default ChatHeader;
