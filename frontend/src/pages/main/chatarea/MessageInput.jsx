import { useChatStore } from "../../../store/chatStore.js";
import { useSocketStore } from "../../../store/socketStore.js";
import { useAuthStore } from "../../../store/authStore.js";
import { CLIENT } from "../../../lib/events.js";
import clsx from "clsx";
import { useState, useRef } from "react";

function MessageInput() {
  const [msg, setmsg] = useState("");
  const typingTimeoutRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const emit = useSocketStore((state) => state.emit);
  const isConnected = useSocketStore((state) => state.isConnected);

  const addMessage = useChatStore((state) => state.addMessage);
  const replaceMessage = useChatStore((state) => state.replaceMessage);
  const removeMessage = useChatStore((state) => state.removeMessage);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const currConversationId = useChatStore(
    (state) => state.currentConversationId,
  );

  // const addTyping = useChatStore((state) => state.addTypingUser);
  // const removeTyping = useChatStore((state) => state.removeTypingUser);

  const handleTyping = () => {
    if (!currConversationId || !isConnected) return;
    //addTyping(currConversationId, user);
    emit(CLIENT.TYPING_START, { conversationId: currConversationId, user });

    //clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    //set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 2000);
  };
  const handleTypingStop = () => {
    if (!currConversationId || !isConnected) return;
    emit(CLIENT.TYPING_STOP, { conversationId: currConversationId, user });
    // removeTyping(currConversationId, user);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };
  const handleSend = async () => {
    if (!msg.trim()) return;
    if (!currConversationId) {
      console.error("no conversation selected, cannot send message");
      return;
    }

    //stop typing before sending message
    handleTypingStop();

    const tempId = crypto.randomUUID(); //generate unique id for message
    const tempMsg = {
      conversationId: currConversationId,
      content: msg,
      replyToId: null,
      messageId: tempId,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    //optimistic update for sender
    addMessage(currConversationId, tempMsg);

    //emit immediately
    setmsg("");
    //console.log("message sent: ", tempMsg);
    if (!isConnected) {
      console.error("socket not connected, cannot send message");
      return;
    }
    emit(CLIENT.SEND_MESSAGE, tempMsg);

    //api call in the background

    const realMsg = await sendMessage(currConversationId, msg);
    const message = {
      conversationId: currConversationId,
      content: msg,
      replyToId: null,
      messageId: realMsg.id,
      user_id: user.id,
    };

    if (realMsg) {
      replaceMessage(currConversationId, tempId, message);
    } else {
      //remove the msg if failed to send
      removeMessage(currConversationId, tempId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key !== "Enter") {
      handleTyping();
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-centergap-3 p-3 gap-2">
      <input
        type="text"
        onKeyDown={handleKeyPress}
        value={msg}
        onChange={(e) => setmsg(e.target.value)}
        className={clsx(
          "input validator",
          " w-full md:max-w-150 rounded-md px-2 border-2 border-gray-200",
          "transition-all duration-200 ease-in-out",
          "focus:outline-none ",
          "hover:border-gray-400",
        )}
      />
      <button onClick={handleSend} className="btn btn-primary">
        Send
      </button>
    </div>
  );
}

export default MessageInput;
