import { useAuthStore } from "../../store/authStore";
import { extractTime } from "../../lib/formatTime";
import { useChatStore } from "../../store/chatStore";

function MessageBubble({ message }) {
  const user = useAuthStore((state) => state.user);
  const isown = message?.user_id === user?.id;

  const currentConvId = useChatStore((state) => state.currentConversationId);
  const convMembers = useChatStore((state) => state.members[currentConvId]);

  // Get message read status
  const getMessageReadInfo = () => {
    if (!isown) return { status: null, readCount: 0 };

    const messageDate = new Date(message?.created_at);
    let count = 0;
    const totalMembers = convMembers?.length || 0;
    const otherMembers = totalMembers - 1;

    convMembers?.forEach((member) => {
      if (member.id !== user?.id && member.last_read_at) {
        if (new Date(member.last_read_at) >= messageDate) {
          count++;
        }
      }
    });

    let messageStatus = "sent";
    if (otherMembers <= 0) {
      messageStatus = "sent";
    } else if (otherMembers === 1) {
      // private chat
      if (count >= 1) messageStatus = "read";
    } else {
      // group chat
      if (count === 0) messageStatus = "sent";
      else if (count < otherMembers) messageStatus = "partially-read";
      else messageStatus = "read";
    }

    return { status: messageStatus, readCount: count };
  };

  const { status, readCount } = getMessageReadInfo();
  const totalMembers = convMembers?.length || 0;

  console.log("message Date: ", new Date(message.created_at));
  console.log("currConvMembers: ", convMembers);
  for (let i = 0; i < totalMembers; i++) {
    console.log("member last read: ", new Date(convMembers[i].last_read_at));
  }
  console.log("totalMembers: ", totalMembers);
  console.log("messageStatus: ", status);
  console.log("readCount: ", readCount);

  // Render appropriate tick icon
  const renderTicks = () => {
    if (!isown) return null;

    switch (status) {
      case "sent":
        return (
          <span className="text-gray-400 text-xs ml-1" aria-label="Sent">
            ✓
          </span>
        );
      case "partially-read":
        return (
          <span
            className="text-gray-500 text-xs ml-1"
            aria-label="Partially read"
          >
            ✓✓
            <span className="text-[0.5rem] ml-0.5">
              ({readCount}/{totalMembers - 1})
            </span>
          </span>
        );
      case "read":
        return (
          <span className="text-blue-500 text-xs ml-1" aria-label="Read">
            ✓✓
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`chat ${isown ? "chat-end" : "chat-start"}`}>
      <div
        className={`chat-bubble ${isown ? "chat-bubble-primary" : "chat-bubble-secondary"}`}
      >
        <div className="flex flex-col">
          <p>{message?.content}</p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <time className="text-[0.625rem] opacity-60 font-semibold">
              {extractTime(message?.created_at)}
            </time>
            {renderTicks()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
