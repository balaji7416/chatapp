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

  if (isConversationsLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 w-full">
            <div className="skeleton h-10 w-10 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/2"></div>
              <div className="skeleton h-3 w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0)
    return (
      <div className="text-base-content/55 font-semibold flex pt-8 justify-center h-full">
        No chats yet
      </div>
    );

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
