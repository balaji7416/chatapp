// components/MessageInput.jsx
import { useState, useRef, useCallback } from "react";
import { useChatStore } from "../../store/chatStore.js";
import { useSocketStore } from "../../store/socketStore.js";
import { useAuthStore } from "../../store/authStore.js";
import { CLIENT } from "../../lib/events.js";
import clsx from "clsx";

function MessageInput() {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const emit = useSocketStore((state) => state.emit);
  const isConnected =
    useSocketStore((state) => state.connectionState) === "connected";

  const sendMessage = useChatStore((state) => state.sendMessage);
  const currentConversationId = useChatStore(
    (state) => state.currentConversationId,
  );

  const handleTypingStop = useCallback(() => {
    if (!currentConversationId || !isConnected) return;
    emit(CLIENT.TYPING_STOP, { conversationId: currentConversationId, user });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [currentConversationId, isConnected, emit, user]);

  const handleTyping = useCallback(() => {
    if (!currentConversationId || !isConnected) {
      console.log("[Msg Input] socket not connected or no current conversation, cannot emit typing start")
      return;
    }
    emit(CLIENT.TYPING_START, { conversationId: currentConversationId, user });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(handleTypingStop, 2000);
  }, [currentConversationId, isConnected, emit, user, handleTypingStop]);

  const handleSend = useCallback(async () => {
    if (!message.trim() || !currentConversationId) return;

    handleTypingStop();

    const tempId = crypto.randomUUID();
    setMessage("");

    // Send via API
    const realMsg = await sendMessage(
      currentConversationId,
      message.trim(),
      tempId,
    );

    if (realMsg) {
      // Broadcast via socket
      if (isConnected) {
        emit(CLIENT.MESSAGE_SEND, {
          conversationId: currentConversationId,
          content: message.trim(),
          replyToId: null,
          messageId: realMsg.id,
          userId: user.id,
          createdAt: realMsg.created_at,
        });
      }
    } else {
      // Remove failed message
      //done in chatstore sendMessage
    }
  }, [
    message,
    currentConversationId,
    user,
    isConnected,
    emit,
    sendMessage,
    handleTypingStop,
  ]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key !== "Enter") {
        handleTyping();
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleTyping, handleSend],
  );

  return (
    <div className="flex items-center gap-2 p-3 border-t border-gray-200">
      <input
        type="text"
        onKeyDown={handleKeyDown}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={clsx(
          "input input-bordered flex-1",
          "transition-all duration-200",
          "focus:outline-none focus:input-primary",
        )}
        placeholder="Type a message..."
        disabled={!currentConversationId}
      />
      <button
        onClick={handleSend}
        className="btn btn-primary"
        disabled={!message.trim() || !currentConversationId}
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;
