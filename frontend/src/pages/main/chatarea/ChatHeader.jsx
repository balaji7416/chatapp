import { useCurrentConversation } from "../../../store/chatStore.js";

function ChatHeader() {
  const currConversation = useCurrentConversation();
  if (!currConversation) return <div>choose a conversation</div>;
  return (
    <div className="p-3 h-10 border-b">
      <h1 className="text-xl font-bold">{currConversation.name}</h1>
    </div>
  );
}

export default ChatHeader;
