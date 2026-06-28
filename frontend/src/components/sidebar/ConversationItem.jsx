import clsx from "clsx";
import { formatMsgTime } from "../../lib/formatTime";
import { User } from "lucide-react";

function ConversationItem({ conversation, onClick, isActive }) {
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
          {conversation?.display_name?.[0]?.toUpperCase() || <User />}
        </div>
        <div className="flex flex-col p-1 overflow-hidden">
          <span className="truncate font-medium text-base-content">
            {conversation?.display_name || conversation?.name || "No name"}
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
