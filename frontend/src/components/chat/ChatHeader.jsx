// components/chat/ChatHeader.jsx (Simplified)
import { CLIENT } from "../../lib/events.js";
import {
  useChatStore,
  useCurrentConversation,
  useCurrentMembers,
} from "../../store/chatStore.js";
import { useSocketStore } from "../../store/socketStore.js";
import { useAuthStore } from "../../store/authStore.js";
import { ArrowLeft, MoreVertical, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function ChatHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const currConversation = useCurrentConversation();
  const members = useCurrentMembers();
  const isMembersLoading = useChatStore((state) => state.isMembersLoading);
  const leaveConversation = useChatStore((state) => state.leaveConversation);
  const emit = useSocketStore((state) => state.emit);
  const isConnected = useSocketStore((state) => state.isConnected);

  if (!currConversation) return null;

  const isInfoPage = location.pathname.includes("/info");

  const handleLeave = async () => {
    await leaveConversation(currConversation?.id);
    if (isConnected) {
      emit(CLIENT.LEAVE_CHAT, { conversationId: currConversation?.id });
    }
  };

  const handleBack = () => {
    if (isInfoPage) {
      navigate(`/chat/${currConversation.id}`);
    } else {
      navigate("/");
    }
  };

  const handleInfoClick = () => {
    if (isInfoPage) {
      navigate(`/chat/${currConversation.id}`);
    } else {
      navigate(`/chat/${currConversation.id}/info`);
    }
  };

  const getMemberText = () => {
    //get chat type
    const isGroup = currConversation.isGroup;
    if (members.length === 0) return "No members";
    if (members.length === 1) return "Only you";

    if (!isGroup) {
      // For one-one
      const otherMember = members.find((m) => m.id !== user?.id).username;
      return otherMember[0].toUpperCase() + otherMember.slice(1);
    }

    // For groups
    const others = members.filter((m) => m.id !== user.id);
    if (others.length === 0) return "No other members";
    if (others.length === 1) return `${others[0]?.username}`;
    if (others.length === 2)
      return `${others[0]?.username} and ${others[1]?.username}`;
    return `${others[0]?.username}, ${others[1]?.username} and ${others.length - 2} others`;
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-base-300 bg-base-100">
      <div className="flex-1 flex items-center gap-3">
        {/* Back button - shows on mobile OR info page */}
        <button
          onClick={handleBack}
          className="btn btn-ghost btn-sm btn-circle lg:hidden" // ← Shows on mobile only
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        {isInfoPage && (
          <button
            onClick={handleBack}
            className="btn btn-ghost btn-sm btn-circle hidden lg:flex" // ← Shows on desktop info page only
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div
          className="flex-1 flex gap-2 cursor-pointer hover:bg-base-200 rounded-lg p-2 transition-all"
          onClick={handleInfoClick}
        >
          <div className="w-full min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold truncate">
                {currConversation.name}
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-base-content/45 shrink-0" />
              <p
                className={`truncate font-semibold text-xs text-base-content/45 ${
                  isMembersLoading ? "skeleton" : ""
                }`}
              >
                {getMemberText()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="dropdown dropdown-bottom dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-sm btn-circle"
        >
          <MoreVertical size={20} />
        </div>
        <ul
          tabIndex="-1"
          className="dropdown-content menu bg-base-100 rounded-box z-10 w-48 p-2 shadow-lg border border-base-200"
        >
          <li>
            <a onClick={handleInfoClick}>
              {isInfoPage ? "Back to Chat" : "Chat Info"}
            </a>
          </li>
          <li>
            <a onClick={handleLeave} className="text-error">
              Leave Chat
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ChatHeader;
