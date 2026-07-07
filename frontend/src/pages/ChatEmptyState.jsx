// pages/ChatEmptyState.jsx
import { useNavigate } from "react-router-dom";
function ChatEmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-base-content/60">
          Welcome to Chat App
        </h2>
        <p className="text-base-content/40 mt-2">
          Select a conversation from the sidebar to start chatting
        </p>

        <button className="btn btn-primary mt-4" onClick={() => navigate("/")}>
          Back to Chats
        </button>
      </div>
    </div>
  );
}

export default ChatEmptyState;
