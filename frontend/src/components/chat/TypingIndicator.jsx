import { useChatStore } from "../../store/chatStore.js";

function TypingIndicator({ conversationId, compact = false }) {
  const typingUsers =
    useChatStore((state) => state.typingUsers[conversationId]) || [];

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    const names = typingUsers.map((u) => u?.username);
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return `${names[0]}, ${names[1]} and ${names.length - 2} others are typing...`;
  };

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
        <span className="text-sm text-gray-500 font-semibold truncate">
          {getTypingText()}
        </span>
      </div>
    );
  }
  return (
    <div className="card bg-base-100 rounded-none w-full">
      <div className="card-body p-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          </div>
          <span className="text-sm text-gray-500 font-semibold truncate">
            {getTypingText()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
