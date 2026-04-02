import ConversationList from "./ConversationList.jsx";
import { useAuthStore } from "../../../store/authStore.js";
import { useChatStore } from "../../../store/chatStore.js";
import clsx from "clsx";

function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const resetChat = useChatStore((state) => state.reset);
  const handleLogout = () => {
    resetChat();
    logout();
  };
  return (
    <div className="w-80 border-r flex flex-col bg-white h-full">
      <div className="p-4 border-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chats</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{user.username}</span>
          <button
            onClick={handleLogout}
            className={clsx("text-xs bg-red-500 text-white px-2 py-1 rounded")}
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ConversationList />
      </div>
    </div>
  );
}

export default Sidebar;
