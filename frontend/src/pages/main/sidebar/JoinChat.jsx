import { useState } from "react";
import clsx from "clsx";
import { CLIENT } from "../../../lib/events";
import { useSocketStore } from "../../../store/socketStore";
import { useChatStore } from "../../../store/chatStore";
function JoinChat({ setView }) {
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);

  const isConnected = useSocketStore((state) => state.isConnected);
  const emit = useSocketStore((state) => state.emit);
  const joinConversation = useChatStore((state) => state.joinConversation);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatId.trim()) return;
    setLoading(true);
    const data = await joinConversation(chatId);
    if (data.success) {
      if (isConnected) {
        emit(CLIENT.JOIN_CHAT, { conversationId: chatId, user: data.user });
      }
      setChatId("");
    }
    setLoading(false);
    setView("chats");
  };
  return (
    <div className="card bg-base-100">
      <form onSubmit={handleSubmit} className="card-body">
        <input
          type="text"
          placeholder="enter chat id"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          className={clsx(
            "input ",
            " w-full rounded-md px-2 border-2 border-gray-200",
            "transition-all duration-200 ease-in-out",
            "focus:outline-none ",
            "hover:border-gray-500 ",
          )}
        />
        <button type="submit" className="btn btn-primary ">
          join
        </button>
      </form>

      {loading && <p>joining...</p>}
    </div>
  );
}

export default JoinChat;
