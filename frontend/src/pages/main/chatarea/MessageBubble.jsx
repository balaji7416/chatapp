import { useAuthStore } from "../../../store/authStore";

function MessageBubble({ message }) {
  const user = useAuthStore((state) => state.user);
  const isown = message?.user_id == user?.id;
  return (
    <div className={`chat ${isown ? "chat-end" : "chat-start"}`}>
      <div
        className={`chat-bubble ${isown ? "chat-bubble-primary" : "chat-bubble-secondary"}`}
      >
        {message?.content}
      </div>
    </div>
  );
}

export default MessageBubble;
