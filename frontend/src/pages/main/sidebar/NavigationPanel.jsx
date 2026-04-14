import { Menu, X, User, LogOut, Plus, Link, MessageSquare } from "lucide-react";
function NavigationPanel({
  onLogout,
  onChatsClick,
  onCreateChatClick,
  onJoinChatClick,
  user,
}) {
  const closeDropdown = () => {
    document?.activeElement?.blur();
  };
  return (
    <div className="dropdown dropdown-end dropdown-bottom">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar bg-base-300"
      >
        {user?.username[0].toUpperCase()}
      </div>

      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm font-semibold"
      >
        <li>
          <a
            onClick={() => {
              onChatsClick();
              closeDropdown();
            }}
            className="gap-4"
          >
            <MessageSquare size={15} />
            <span>Chats</span>
          </a>
        </li>
        <li>
          <a
            onClick={() => {
              onCreateChatClick();
              closeDropdown();
            }}
            className="gap-4"
          >
            <Plus size={15} /> <span>New Chat</span>
          </a>
        </li>
        <li>
          <a
            onClick={() => {
              onJoinChatClick();
              closeDropdown();
            }}
            className="gap-4"
          >
            <Link size={15} /> <span>Join Chat</span>
          </a>
        </li>
        <div className="divider my-1"></div>
        <li>
          <a onClick={onLogout} className="text-red-600 gap-4">
            <LogOut size={15} /> <span>Logout</span>
          </a>
        </li>
      </ul>
    </div>
  );
}

export default NavigationPanel;
