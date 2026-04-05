import { useChatStore } from "../../../store/chatStore.js";
import { useSocketStore } from "../../../store/socketStore.js";

import { CLIENT } from "../../../lib/events.js";

import { useState } from "react";
function MessageInput() {
  const [msg, setmsg] = useState("");

  const emit = useSocketStore((state) => state.emit);
  const isConnected = useSocketStore((state) => state.isConnected);

  const currConversationId = useChatStore(
    (state) => state.currentConversationId,
  );

  const handleSend = () => {
    if (!msg) return;
    if (!isConnected) {
      console.error("socket not connected, cannot send message");
      return;
    }
    if (!currConversationId) {
      console.error("no conversation selected, cannot send message");
      return;
    }
    const message = {
      conversationId: currConversationId,
      content: msg,
    };
    emit(CLIENT.SEND_MESSAGE, message);
    setmsg("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-b-3">
      <input
        type="text"
        onKeyPress={handleKeyPress}
        value={msg}
        onChange={(e) => setmsg(e.target.value)}
        className="border-2 border-gray-100 rounded-md py-1 px-3"
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default MessageInput;
