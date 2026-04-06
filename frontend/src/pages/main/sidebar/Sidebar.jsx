import ConversationList from "./ConversationList.jsx";
import CreateChat from "./CreateChat.jsx";
import JoinChat from "./JoinChat.jsx";
import NavigationPanel from "./NavigationPanel.jsx";
import { useAuthStore } from "../../../store/authStore.js";
import { useChatStore } from "../../../store/chatStore.js";
// import clsx from "clsx";
import { useState } from "react";

function Sidebar() {
  const [openOptions, setOpenOptions] = useState(false);
  const [view, setView] = useState("chats");

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const resetChat = useChatStore((state) => state.reset);
  const handleLogout = async () => {
    resetChat();
    await logout();
  };
  return (
    <div className="w-80 border-r flex flex-col bg-white h-full">
      <div className="p-4 border-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chats</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{user.username}</span>
          <button
            // onClick={handleLogout}
            // className={clsx("text-xs bg-red-500 text-white px-2 py-1 rounded")}
            onClick={() => setOpenOptions((prev) => !prev)}
          >
            * *
          </button>
          {openOptions && (
            <NavigationPanel
              onLogout={() => {
                setOpenOptions(false);
                handleLogout();
              }}
              onChatsClick={() => {
                setOpenOptions(false);
                setView("chats");
              }}
              onCreateChatClick={() => {
                setOpenOptions(false);
                setView("create");
              }}
              onJoinChatClick={() => {
                setOpenOptions(false);
                setView("join");
              }}
            />
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {view === "chats" && <ConversationList />}
        {view === "create" && <CreateChat />}
        {view === "join" && <JoinChat />}
      </div>
    </div>
  );
}

export default Sidebar;
