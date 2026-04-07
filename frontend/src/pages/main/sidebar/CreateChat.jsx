import { useState } from "react";
import api from "../../../lib/api";
import { useToastStore } from "../../../store/toastStore";
function CreateChat() {
  const [chatName, setChatName] = useState("");
  const [member, setMember] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const showSuccess = useToastStore((state) => state.success);
  const showError = useToastStore((state) => state.error);
  const showInfo = useToastStore((state) => state.info);

  const addMember = () => {
    if (!member) {
      showInfo("Please enter a member");
    }
    if (members.includes(member)) {
      showInfo("Member already added");
    }
    setMembers([...members, member]);
    setMember("");
  };
  const removeMember = (id) => {
    setMembers(members.filter((member) => member !== id));
    setMember("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(chatName, members);
    try {
      setLoading(true);
      await api.post("/conversations", {
        name: chatName,
        isGroup: true,
        members,
      });
      showSuccess("Chat created successfully");
      setChatName("");
      setMembers([]);
    } catch (error) {
      console.error("Error in creating chat: ", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create chat";
      showError(msg);
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
            <li key={member}>
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
    </div>
  );
}

export default CreateChat;
