import { useState } from "react";
import api from "../../../lib/api";
import { useChatStore } from "../../../store/chatStore";
function JoinChat() {
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);

  const showError = useChatStore((state) => state.error);
  const showSuccess = useChatStore((state) => state.success);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/conversations/${chatId}/join`, { chatId });
      showSuccess(res.data.message);
      setChatId("");
    } catch (err) {
      console.error("Error in joining chat", err);
      const msg = err.response?.data?.message || err.message || "Unknown error";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="enter chat id"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
        />
        <button type="submit">join</button>
      </form>

      {loading && <p>joining...</p>}
    </div>
  );
}

export default JoinChat;
