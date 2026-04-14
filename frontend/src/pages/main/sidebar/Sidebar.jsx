import ConversationList from "./ConversationList.jsx";
import CreateChat from "./CreateChat.jsx";
import clsx from "clsx";
import JoinChat from "./JoinChat.jsx";
import NavigationPanel from "./NavigationPanel.jsx";
import { useAuthStore } from "../../../store/authStore.js";
import { useChatStore } from "../../../store/chatStore.js";
// import clsx from "clsx";
import { useState } from "react";

function Sidebar() {
  const [view, setView] = useState("chats");

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const resetChat = useChatStore((state) => state.reset);
  const handleLogout = async () => {
    resetChat();
    await logout();
  };
  return (
    <div
      className={clsx(
        "flex flex-col h-full",
        "w-full lg:w-100 ",
        "overflow-y-auto",
        "",
      )}
    >
      <div className="p-4 flex justify-between items-center  border-b border-gray-300">
        <h1 className="text-xl font-bold">Chats</h1>

        <NavigationPanel
          onLogout={() => {
            handleLogout();
          }}
          onChatsClick={() => {
            setView("chats");
          }}
          onCreateChatClick={() => {
            setView("create");
          }}
          onJoinChatClick={() => {
            setView("join");
          }}
          user={user}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {view === "chats" && <ConversationList />}
        {view === "create" && <CreateChat setView={setView} />}
        {view === "join" && <JoinChat setView={setView} />}
      </div>
    </div>
  );
}

export default Sidebar;
