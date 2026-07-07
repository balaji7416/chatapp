// components/sidebar/ConversationItem.jsx
import { memo } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { formatMsgTime } from "../../lib/formatTime";
import TypingIndicator from "../chat/TypingIndicator";

/**
 * ConversationItem - Individual conversation item in sidebar
 * Memoized to prevent unnecessary re-renders
 */
const ConversationItem = memo(({ conversation, isActive, onSelect }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onSelect?.(conversation.id);
    navigate(`/chat/${conversation.id}`);
  };

  // Get display name
  const displayName =
    conversation?.display_name || conversation?.name || "Unknown";
  const lastMessage = conversation?.last_message?.content || "No messages";
  const lastMessageAt = conversation?.last_message_at;
  const unreadCount = Number(
    conversation?.unread_count ?? conversation?.unreadCount ?? 0
  );

  // Get avatar initial
  const avatarInitial = displayName?.[0]?.toUpperCase() || "?";

  return (
    <div
      onClick={handleClick}
      className={clsx(
        "flex cursor-pointer items-center justify-between rounded-md transition-all duration-100 p-2",
        isActive ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-base-200",
        "active:scale-[.98]",
      )}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Avatar */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="avatar placeholder">
          <div className="bg-accent/50 text-accent-content rounded-full w-10 h-10 flex items-center justify-center">
            <span className="font-bold text-sm">{avatarInitial}</span>
          </div>
        </div>

        {/* Conversation Info */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate font-medium text-base-content">
            {displayName}
          </span>
          <div className="flex items-center gap-1">
            <span className="truncate text-sm text-base-content/50">
              {lastMessage}
            </span>
          </div>
        </div>
      </div>
      {/* Typing indicator - only show if there are typing users */}
      <TypingIndicator conversationId={conversation.id} compact={true} />
      {/* Meta (Time + Unread) */}
      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
        {lastMessageAt && (
          <span className="text-xs text-base-content/40 font-medium whitespace-nowrap">
            {formatMsgTime(lastMessageAt)}
          </span>
        )}
        {unreadCount > 0 && (
          <div className="badge badge-primary badge-sm min-w-[1.25rem] h-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </div>
    </div>
  );
});

export default ConversationItem;
