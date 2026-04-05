import { useState } from "react";
import api from "../../../lib/api";

function CreateChat() {
  const [chatName, setChatName] = useState("");
  const [member, setMember] = useState("");
  const [members, setMembers] = useState([]);
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

  const addMember = () => {
    if (!member) {
      showToast("Member username is required", "info");
    }
    if (members.includes(member)) {
      showToast("Member already added", "error", "info");
    }
    setMembers([...members, member]);
    setMember("");
  };
  const removeMember = (id) => {
    setMembers(members.filter((member) => member !== id));
    setMember("");
  };
  const handleSubmit = async (e) => {
    setError("");
    e.preventDefault();
    console.log(chatName, members);
    try {
      setLoading(true);
      await api.post("/conversations", {
        name: chatName,
        isGroup: true,
        members,
      });
      showToast("Chat created successfully", "success");
      setError("");
      setChatName("");
      setMembers([]);
    } catch (error) {
      console.error("Error in creating chat: ", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create chat";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>create chat</h1>
        <input
          type="text"
          placeholder="enter chat name"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
        />
        <div>
          <input
            type="text"
            placeholder="enter member id"
            value={member}
            onChange={(e) => setMember(e.target.value)}
          />
          <button type="button" onClick={addMember}>
            add
          </button>
        </div>
        <ul>
          <li>You</li>
          {members.length === 0 && <li>no members</li>}
          {members.map((member) => (
            <li>
              <span>{member}</span>
              <button type="button" onClick={() => removeMember(member)}>
                remove
              </button>
            </li>
          ))}
        </ul>
        <button type="submit">create</button>
      </form>
      {loading && <div>loading...</div>}
      {error && <div>{error}</div>}
      {success && <div>Chat created successfully</div>}
      {info && <div>{info}</div>}
    </div>
  );
}

export default CreateChat;
