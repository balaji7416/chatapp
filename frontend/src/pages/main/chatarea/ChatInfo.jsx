import {
  useChatStore,
  useCurrentConversation,
  useCurrentMembers,
} from "../../../store/chatStore.js";
import { useAuthStore } from "../../../store/authStore.js";
import { useEffect } from "react";
import { ArrowLeft, Users, Copy, Check } from "lucide-react";
import { useState } from "react";

function ChatInfo() {
  const [copied, setCopied] = useState(false);
  const user = useAuthStore((state) => state.user);
  const currentConv = useCurrentConversation();
  const members = useCurrentMembers();
  const isMembersLoading = useChatStore((state) => state.isMembersLoading);
  const fetchMembers = useChatStore((state) => state.fetchMembers);

  // Find current user's role
  const currentUserMember = members.find((m) => m.id === user?.id);
  const userRole = currentUserMember?.role || "member";

  // Fetch members on load
  useEffect(() => {
    if (!currentConv) return;
    if (!members || members.length === 0) fetchMembers(currentConv.id);
  }, [currentConv, fetchMembers, members]);

  // Copy chat ID to clipboard
  const copyChatId = () => {
    navigator.clipboard.writeText(currentConv?.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Separate current user from other members
  const otherMembers = members.filter((m) => m.id !== user?.id);
  const isAdmin = userRole === "admin";

  if (!currentConv) return null;

  return (
    <div className="h-full bg-base-100">
      <div className="p-4 space-y-6">
        {/* Conversation Name & ID */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg">{currentConv.name}</h3>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs text-base-content/60  flex-1 mt-2">
                ID: {currentConv.id}
              </code>
              <button
                onClick={copyChatId}
                className="btn btn-ghost btn-sm "
                title="Copy Chat ID"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <h3 className="font-semibold">Members</h3>
            </div>
            <span className="badge badge-primary badge-sm">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>

          {isMembersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="skeleton h-10 w-10 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-32"></div>
                    <div className="skeleton h-3 w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Current user */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-10 flex items-center justify-center">
                    <span>{user?.username?.[0]?.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user?.username}</p>
                    <span className="badge badge-primary badge-xs">You</span>
                  </div>
                  <p className="text-xs text-base-content/60 capitalize">
                    {userRole}
                  </p>
                </div>
                {isAdmin && (
                  <div className="badge badge-outline badge-sm">Admin</div>
                )}
              </div>

              {/* Other members */}
              {otherMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-all duration-100"
                >
                  <div className="avatar">
                    <div className="bg-neutral text-neutral-content rounded-full w-10 flex items-center justify-center">
                      <span>{member.username?.[0]?.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{member.username}</p>
                    <p className="text-xs text-base-content/60 capitalize">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}

              {otherMembers.length === 0 && (
                <div className="text-center py-8 text-base-content/40">
                  <p className="text-sm">No other members</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin note */}
        {isAdmin && (
          <div className="alert alert-info shadow-sm">
            <span className="text-xs font-semibold text-white">
              You are an admin. You can add or remove members.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInfo;
