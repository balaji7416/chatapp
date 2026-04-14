import { useEffect } from "react";
import { useChatStore } from "../../../store/chatStore.js";
import ConversationItem from "./ConversationItem.jsx";

function ConversationList() {
  const conversations = useChatStore((state) => state.conversations);
  const fetchConversations = useChatStore((state) => state.fetchConversations);
  const isConversationsLoading = useChatStore(
    (state) => state.isConversationsLoading,
  );
  const selectConversation = useChatStore((state) => state.selectConversation);
  const currConversationId = useChatStore(
    (state) => state.currentConversationId,
  );
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (isConversationsLoading) return <div>Loading...</div>;

  if (conversations.length === 0) return <div>No conversations</div>;

  return (
    <div className="flex flex-col space-y-3 p-2 overflow-y-auto">
      {conversations.map((c) => (
        <ConversationItem
          key={c.id}
          conversation={c}
          onClick={() => selectConversation(c.id)}
          isActive={c.id === currConversationId}
        />
      ))}
    </div>
  );
}

export default ConversationList;
