import { useChatStore } from "../../../store/chatStore.js";
import { useSocketStore } from "../../../store/socketStore.js";

import { CLIENT } from "../../../lib/events.js";

import { useState } from "react";

function MessageInput() {
  const [msg, setmsg] = useState("");

  const emit = useSocketStore((state) => state.emit);
  const isConnected = useSocketStore((state) => state.isConnected);

  const sendMessage = useChatStore((state) => state.sendMessage);
  const currConversationId = useChatStore(
    (state) => state.currentConversationId,
  );

  const handleSend = () => {
    if (!msg.trim()) return;
    if (!currConversationId) {
      console.error("no conversation selected, cannot send message");
      return;
    }

    //ui is updated for sender instantly, as message is added to the store in the sendMessage function
    const sendtMsg = sendMessage(currConversationId, msg);
    const message = {
      conversationId: currConversationId,
      content: msg,
      replyToId: null,
      messageId: sendtMsg.id,
    };
  setmsg("");
    if (!isConnected) {
      console.error("socket not connected, cannot send message");
      return;
    }
    emit(CLIENT.SEND_MESSAGE, message);
   
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
        onKeyDown={handleKeyPress}
        value={msg}
        onChange={(e) => setmsg(e.target.value)}
        className="border-2 border-gray-100 rounded-md py-1 px-3"
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default MessageInput;
