import { useCurrentConversation } from "../../../store/chatStore.js";

function ChatHeader() {
  const currConversation = useCurrentConversation();
  if (!currConversation) return <div>choose a conversation</div>;
  return (
    <div>
      <h1>{currConversation.name}</h1>
    </div>
  );
}

export default ChatHeader;
