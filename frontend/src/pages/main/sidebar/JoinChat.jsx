import { useState } from "react";
import api from "../../../lib/api";

function JoinChat() {
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [info, setInfo] = useState(false);

  const showToast = (message, type, duration = 3000) => {
    if (type === "error") {
      setError(message);
      setSuccess(false);
      setTimeout(() => {
        setError("");
      }, duration);
    } else if (type === "success") {
      setSuccess(message);
      setError("");
      setTimeout(() => {
        setSuccess("");
      }, duration);
    } else if (type === "info") {
      setInfo(message);
      setError("");
      setTimeout(() => {
        setInfo("");
      }, duration);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
      {info && <p>{info}</p>}
    </div>
  );
}

export default JoinChat;
