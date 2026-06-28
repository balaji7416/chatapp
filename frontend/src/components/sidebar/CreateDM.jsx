import clsx from "clsx";
import { useState } from "react";
import api from "../../lib/api";
import { useToastStore } from "../../store/toastStore";
function CreateDM({ setView }) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const showError = useToastStore((state) => state.error);
  const showSuccess = useToastStore((state) => state.success);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      setLoading(true);
      await api.post("/conversations", {
        members: [username],
        isGroup: false,
      });
      showSuccess("DM created successfully");
      setView("chats");
    } catch (e) {
      console.log("Error in creating DM: ", e);
      showError("Failed to create DM: " + e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="card bg-base-100">
      <form onSubmit={handleSubmit} className="card-body">
        <input
          type="text"
          placeholder="enter username of user to DM"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={clsx(
            "input ",
            " w-full rounded-md px-2 border-2 border-gray-200",
            "transition-all duration-200 ease-in-out",
            "focus:outline-none ",
            "hover:border-gray-500 ",
          )}
        />
        <button type="submit" className="btn btn-primary ">
          Create
        </button>
      </form>

      {loading && <p>joining...</p>}
    </div>
  );
}

export default CreateDM;
