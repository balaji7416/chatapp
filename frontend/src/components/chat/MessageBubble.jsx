// components/MessageBubble.jsx
import { useAuthStore } from "../../store/authStore";
import { extractTime } from "../../lib/formatTime";
import { useChatStore } from "../../store/chatStore";
import { useMemo } from "react";

// Extract read status logic to custom hook
function useMessageReadStatus(message, isOwn) {
  const currentConvId = useChatStore((state) => state.currentConversationId);
  const convMembers = useChatStore((state) => state.members[currentConvId]);
  const user = useAuthStore((state) => state.user);

  // console.log("conversation members: ", convMembers);
  // console.log("message: ", message);
  // console.log("message date: ", new Date(message?.created_at));

  return useMemo(() => {
    if (!isOwn) return { status: null, readCount: 0 };

    const messageDate = new Date(message?.created_at || message.createdAt);
    let readCount = 0;
    const totalMembers = convMembers?.length || 0;
    const otherMembers = totalMembers - 1;

    convMembers?.forEach((member) => {
      // console.log("member: ", member);
      // console.log("member last read: ", member.lastReadAt);
      // console.log("message date: ", messageDate);
      if (member.id === user?.id) return;

      const lastRead = member.last_read_at || member.lastReadAt;
      if (lastRead && new Date(lastRead) >= messageDate) readCount++;
    });

    let status = "sent";
    if (otherMembers <= 0) {
      status = "sent";
    } else if (otherMembers === 1) {
      status = readCount >= 1 ? "read" : "sent";
    } else {
      if (readCount === 0) status = "sent";
      else if (readCount < otherMembers) status = "partially-read";
      else status = "read";
    }

    return { status, readCount };
  }, [message, isOwn, convMembers, user]);
}

//  Extract tick rendering to small component
function ReadTicks({ status, readCount, totalMembers }) {
  if (!status) return null;

  switch (status) {
    case "sent":
      return <span className="text-gray-400 text-xs ml-1">✓</span>;
    case "partially-read":
      return (
        <span className="text-gray-500 text-xs ml-1">
          ✓✓
          <span className="text-[0.5rem] ml-0.5">
            ({readCount}/{totalMembers - 1})
          </span>
        </span>
      );
    case "read":
      return <span className="text-blue-500 text-xs ml-1">✓✓</span>;
    default:
      return null;
  }
}

function MessageBubble({ message }) {
  const user = useAuthStore((state) => state.user);
  const isOwn = message?.user_id === user?.id;
  const currentConvId = useChatStore((state) => state.currentConversationId);
  const convMembers = useChatStore((state) => state.members[currentConvId]);

  const { status, readCount } = useMessageReadStatus(message, isOwn);
  const totalMembers = convMembers?.length || 0;

  //
  // if (import.meta.env.VITE_ENV === "development") {
  //   console.log("Message read status:", {
  //     messageId: message.id,
  //     status,
  //     readCount,
  //   });
  // }

  return (
    <div className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
      <div
        className={`chat-bubble ${isOwn ? "chat-bubble-primary" : "chat-bubble-secondary"}`}
      >
        <div className="flex flex-col">
          <p>{message?.content}</p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <time className="text-[0.625rem] opacity-60 font-semibold">
              {extractTime(message?.created_at || message.createdAt)}
            </time>
            <ReadTicks
              status={status}
              readCount={readCount}
              totalMembers={totalMembers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
