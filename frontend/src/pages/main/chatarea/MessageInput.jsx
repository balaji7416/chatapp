import { useChatStore } from "../../../store/chatStore.js";
import { useState } from "react";
function MessageInput() {
  const [msg, setmsg] = useState("");
  const currConversationId = useChatStore(
    (state) => state.currentConversationId,
  );

  const addMessage = useChatStore((state) => state.addMessage);

  const handleSend = () => {
    if (!msg) return;

    const message = {
      content: msg,
    };
    addMessage(currConversationId, message);
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
