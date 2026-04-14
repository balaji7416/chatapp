import clsx from "clsx";
import { useChatStore } from "../../../store/chatStore";
import { formatMsgTime } from "../../../lib/formatTime";
import { User } from "lucide-react";
function ConversationItem({ conversation, onClick, isActive }) {
  const convLoading = useChatStore((state) => state.isConversationsLoading);
  if (convLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 w-full">
            <div className="skeleton h-10 w-10 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/2"></div>
              <div className="skeleton h-3 w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex cursor-pointer items-center justify-between rounded-md transition-all duration-100",
        isActive ? "bg-primary/10" : "hover:bg-base-200",
        "active:scale-[.98] p-1",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="avatar rounded-full w-10 h-10 items-center justify-center bg-accent/50">
          {conversation?.name[0].toUpperCase() || <User />}
        </div>
        <div className="flex flex-col p-1 overflow-hidden">
          <span className="truncate font-medium text-base-content">
            {conversation?.name}
          </span>
          <span className="truncate text-sm text-base-content/50">
            {conversation?.last_message?.content || "No messages"}
          </span>
        </div>
      </div>

      <div className="flex flex-col p-1 gap-2">
        <span className="text-xs text-base-content/50 font-semibold">
          {formatMsgTime(conversation?.last_message_at)}
        </span>
        {conversation?.unread_count > 0 && (
          <div className="badge badge-primary badge-sm">
            {conversation?.unread_count}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationItem;
