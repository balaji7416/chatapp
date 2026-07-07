// components/MessageList.jsx
import { useEffect, useRef } from "react";
import { SERVER } from "../../lib/events.js";
import {
  useChatStore,
  useCurrentMessages,
  // useCurrentConversation,
} from "../../store/chatStore.js";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

function MessageList() {
  const currentConvId = useChatStore((state) => state.currentConversationId);
  const isMessagesLoading = useChatStore((state) => state.isLoading.messages);
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const messages = useCurrentMessages();
  // const currentConversation = useCurrentConversation();

  const messagesEndRef = useRef(null);

  // Fetch messages on conversation change
  useEffect(() => {
    if (!currentConvId) return;
    fetchMessages(currentConvId);
  }, [currentConvId, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Loading states
  if (!currentConvId) {
    return (
      <div className="h-full flex items-center justify-center text-base-content/55 font-semibold">
        Select a conversation to start chatting
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex items-center justify-center text-base-content/55 font-semibold">
        Loading messages...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-base-content/55 font-semibold">
        No messages yet. Say hello! 👋
      </div>
    );
  }

  return (
    <div className="h-full p-4 pb-16 overflow-y-auto space-y-2">
      {messages.map((message) => (
        <MessageBubble
          key={message.id || message.messageId}
          message={message}
        />
      ))}
      <TypingIndicator conversationId={currentConvId}/>
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
