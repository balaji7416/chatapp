import { useAuthStore } from "../../../store/authStore";
import { extractTime } from "../../../lib/formatTime";
function MessageBubble({ message }) {
  const user = useAuthStore((state) => state.user);
  const isown = message?.user_id === user?.id;
  // console.log("message: ", message);
  return (
    <div className={`chat ${isown ? "chat-end" : "chat-start"}`}>
      <div
        className={`chat-bubble ${isown ? "chat-bubble-primary" : "chat-bubble-secondary"}`}
      >
        <div className="flex flex-col">
          <p>{message?.content}</p>
          <time className="text-[0.625rem] opacity-60 font-semibold">
            {extractTime(message?.created_at)}
          </time>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
