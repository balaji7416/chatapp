import { useState } from "react";
import clsx from "clsx";
import api from "../../../lib/api";
import { useToastStore } from "../../../store/toastStore";
import { Plus } from "lucide-react";
function CreateChat({ setView }) {
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
      setView("chats");
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
    <div className="card bg-base-100">
      <form onSubmit={handleSubmit} className="card-body">
        <h1 className="card-title font-bold">create chat</h1>
        <input
          type="text"
          placeholder="enter chat name"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          className={clsx(
            "input ",
            " w-full rounded-md px-2 border-2 border-gray-200",
            "transition-all duration-200 ease-in-out",
            "focus:outline-none ",
            "hover:border-gray-500 ",
          )}
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="username"
            value={member}
            onChange={(e) => setMember(e.target.value)}
            className={clsx(
              "input ",
              " w-full rounded-md px-2 border-2 border-gray-200",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none ",
              "hover:border-gray-500 ",
            )}
          />
          <button type="button" onClick={addMember} className="btn btn-primary">
            <Plus />
          </button>
        </div>
        <ul className="list bg-base-100 rounded-box shadow-md">
          <li className="list-row">You</li>
          {members.map((member) => (
            <li
              key={member}
              className="list-row flex justify-between items-center"
            >
              <span className="font-semibold tracking-wider">{member}</span>
              <button
                type="button"
                className="btn btn-error"
                onClick={() => removeMember(member)}
              >
                remove
              </button>
            </li>
          ))}
        </ul>
        <button type="submit" className="btn btn-primary">
          create
        </button>
      </form>
      {loading && <div>loading...</div>}
    </div>
  );
}

export default CreateChat;
