import { useEffect, useRef } from "react";
import { useChatStore, useCurrentMessages } from "../../../store/chatStore.js";
import MessageBubble from "./MessageBubble.jsx";

function MessageList() {
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const currentConvId = useChatStore((state) => state.currentConversationId);
  const fetchMessages = useChatStore((state) => state.fetchMessages);

  const msgsEndRef = useRef(null);

  //fetch messaegs on reload
  useEffect(() => {
    if (!currentConvId) return;
    fetchMessages(currentConvId);
  }, [fetchMessages, currentConvId]);

  const messages = useCurrentMessages();

  //auto scroll to new mesg
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentConvId)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        select a conversation to start chatting
      </div>
    );
  if (isMessagesLoading)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  if (messages.length === 0)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No messages
      </div>
    );
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {/*for auto scroll to new mesg */}
      <div ref={msgsEndRef}></div>
    </div>
  );
}

export default MessageList;
