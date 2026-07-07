// stores/chatStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api.js";
import { useToastStore } from "./toastStore.js";
import { useAuthStore } from "./authStore.js";
import { useSocketStore } from "./socketStore.js";
import { CLIENT, SERVER } from "../lib/events.js";

// ============================================
// SELECTORS (Derived State)
// ============================================
export const selectCurrentConversation = (state) => {
  return state.conversations.find((c) => c.id === state.currentConversationId);
};

export const selectCurrentMessages = (state) => {
  return state.messages[state.currentConversationId] || [];
};

export const selectCurrentMembers = (state) => {
  return state.members[state.currentConversationId] || [];
};

export const selectCurrentTypingUsers = (state) => {
  return state.typingUsers[state.currentConversationId] || [];
};

// ============================================
// MAIN STORE
// ============================================
export const useChatStore = create(
  persist(
    (set, get) => ({
      //UI state
      chatChosen: false,
      setChatChosen: (value) => set({ chatChosen: value }),

      // ===== Data State =====
      conversations: [],
      currentConversationId: null,

      messages: {}, // { conversationId: [messages] }
      members: {}, // { conversationId: [members] }
      typingUsers: {}, // { conversationId: [users] }

      // ===== Loading States =====
      isLoading: {
        conversations: false,
        messages: false,
        members: false,
      },

      // ===== Error States =====
      errors: {
        conversations: null,
        messages: null,
        members: null,
      },

      // ===== Message Actions =====

      /**
       * Add a message to a conversation (with deduplication)
       */
      addMessage: (conversationId, message) => {
        set((state) => {
          const existingMessages = state.messages[conversationId] || [];

          // Check for duplicates
          const exists = existingMessages.some((m) => m.id === message.id);

          if (exists) return state;

          return {
            messages: {
              ...state.messages,
              [conversationId]: [...existingMessages, message],
            },
          };
        });

        // console.log("[ADD MSG] added msg: ", message);
        // console.log("final state: ", get().messages[conversationId]);
      },

      /**
       * Replace/update a message (for optimistic updates)
       */
      updateMessage: (conversationId, messageId, updates) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] || []).map(
              (msg) =>
                msg.id === messageId || msg.messageId === messageId
                  ? { ...msg, ...updates }
                  : msg,
            ),
          },
        }));
      },

      /**
       * Remove a message from a conversation
       */
      removeMessage: (conversationId, messageId) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] || []).filter(
              (msg) => msg.id !== messageId && msg.messageId !== messageId,
            ),
          },
        }));
      },

      /**
       * Set all messages for a conversation (used for initial load)
       */
      setMessages: (conversationId, messages) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: messages,
          },
        }));
      },

      // ===== Member Actions =====

      addMember: (conversationId, member) => {
        set((state) => {
          const existing = state.members[conversationId] || [];
          // Prevent duplicate members
          if (existing.some((m) => m.id === member?.id)) {
            return state;
          }
          return {
            members: {
              ...state.members,
              [conversationId]: [...existing, member],
            },
          };
        });
        get().fetchMembers(conversationId);
      },

      removeMember: (conversationId, userId) => {
        set((state) => ({
          members: {
            ...state.members,
            [conversationId]: (state.members[conversationId] || []).filter(
              (m) => m.id !== userId,
            ),
          },
        }));
        get().fetchMembers(conversationId);
      },

      setMembers: (conversationId, members) => {
        set((state) => ({
          members: {
            ...state.members,
            [conversationId]: members,
          },
        }));
      },

      updateMemberLastRead: (conversationId, userId, lastReadAt) => {
        set((state) => ({
          members: {
            ...state.members,
            [conversationId]: (state.members[conversationId] || []).map((m) =>
              m.id === userId
                ? { ...m, lastReadAt: lastReadAt, last_read_at: lastReadAt }
                : m,
            ),
          },
        }));
      },

      // ===== Typing Actions =====

      addTypingUser: (conversationId, user) => {
        const currentUser = useAuthStore.getState().user;

        // Don't add self
        if (user?.id === currentUser?.id) {
          console.log(
            "[ChatStore] Not adding self to typing users (current user is typing)",
          );
          return;
        }

        set((state) => {
          const currentTyping = state.typingUsers[conversationId] || [];

          //  Check if already typing
          if (currentTyping.some((u) => u.id === user?.id)) return state;

          return {
            typingUsers: {
              ...state.typingUsers,
              [conversationId]: [...currentTyping, user],
            },
          };
        });
      },

      removeTypingUser: (conversationId, userId) => {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: (state.typingUsers[conversationId] || []).filter(
              (u) => u.id !== userId,
            ),
          },
        }));
      },

      clearTypingUsers: (conversationId) => {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: [],
          },
        }));
      },

      // ===== Conversation Actions =====

      setConversations: (conversations) => set({ conversations }),

      addConversation: (conversation) => {
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        }));
      },

      updateConversation: (conversationId, updates) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, ...updates } : c,
          ),
        }));
      },

      removeConversation: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.filter(
            (c) => c.id !== conversationId,
          ),
          messages: {
            ...state.messages,
            [conversationId]: undefined,
          },
          members: {
            ...state.members,
            [conversationId]: undefined,
          },
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: undefined,
          },
        }));
      },

      setCurrentConversationId: (id) => set({ currentConversationId: id }),

      // ===== Loading & Error Actions =====

      setLoading: (key, value) => {
        set((state) => ({
          isLoading: {
            ...state.isLoading,
            [key]: value,
          },
        }));
      },

      setError: (key, error) => {
        set((state) => ({
          errors: {
            ...state.errors,
            [key]: error,
          },
        }));
      },

      clearErrors: () => {
        set({
          errors: {
            conversations: null,
            messages: null,
            members: null,
          },
        });
      },

      // ===== API Actions =====

      fetchConversations: async () => {
        const { setLoading, setError, setConversations } = get();

        try {
          setLoading("conversations", true);
          setError("conversations", null);

          const response = await api.get("/conversations");
          setConversations(response.data.data || []);
        } catch (error) {
          console.error("[ChatStore] Fetch conversations error:", error);
          setError(
            "conversations",
            error.response?.data?.message || "Failed to fetch conversations",
          );
          useToastStore.getState().error("Failed to load conversations");
        } finally {
          setLoading("conversations", false);
        }
      },

      fetchMessages: async (conversationId, page = 1, limit = 50) => {
        const { setLoading, setError, setMessages } = get();

        try {
          setLoading("messages", true);
          setError("messages", null);

          const response = await api.get(`/messages/${conversationId}`, {
            params: { page, limit },
          });

          setMessages(conversationId, response.data.data || []);
        } catch (error) {
          console.error("[ChatStore] Fetch messages error:", error);
          setError(
            "messages",
            error.response?.data?.message || "Failed to fetch messages",
          );
          useToastStore.getState().error("Failed to load messages");
        } finally {
          setLoading("messages", false);
        }
      },

      fetchMembers: async (conversationId) => {
        const { setLoading, setError, setMembers } = get();

        try {
          setLoading("members", true);
          setError("members", null);

          const response = await api.get(
            `/conversations/${conversationId}/members`,
          );
          setMembers(conversationId, response.data?.data || []);
        } catch (error) {
          console.error("[ChatStore] Fetch members error:", error);
          setError(
            "members",
            error.response?.data?.message || "Failed to fetch members",
          );
          useToastStore.getState().error("Failed to load members");
        } finally {
          setLoading("members", false);
        }
      },

      sendMessage: async (conversationId, content, tempId = null) => {
        const { addMessage, updateMessage, removeMessage } = get();
        const toast = useToastStore.getState();

        // Generate temp ID for optimistic update
        const messageId = tempId || `temp-${Date.now()}`;

        // Optimistically add message
        const tempMessage = {
          id: messageId,
          conversationId,
          content,
          isPending: true,
          isOptimistic: true,
          userId: useAuthStore.getState().user?.id,
          user_id: useAuthStore.getState().user?.id,
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          status: "sending",
        };

        addMessage(conversationId, tempMessage);

        try {
          const response = await api.post(`/messages/${conversationId}`, {
            messageContent: content,
          });

          const realMessage = response.data.data;
          //console.log("from chatstore api res: ", realMessage);
          //  Replace temp message with real one
          updateMessage(conversationId, messageId, {
            ...realMessage,
            isPending: false,
            isOptimistic: false,
            status: "sent",
          });

          return realMessage;
        } catch (error) {
          console.error("[ChatStore] Send message error:", error);

          // Update message to show error state
          updateMessage(conversationId, messageId, {
            status: "error",
            error: error.response?.data?.message || "Failed to send",
            isPending: false,
          });

          toast.error("Failed to send message");

          // Optionally remove after some time
          setTimeout(() => {
            removeMessage(conversationId, messageId);
          }, 5000);

          return null;
        }
      },

      markConversationAsRead: async (conversationId) => {
        try {
          //  Emit socket event for real-time update
          useSocketStore.getState().emit(CLIENT.MESSAGE_READ, {
            conversationId,
          });

          //reset local unread count state for user
          set((state) => {
            const updatedConversations = state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    unreadCount: 0,
                    unread_count: 0,
                    // Keep the last message intact
                  }
                : conv,
            );

            return {
              conversations: updatedConversations,
            };
          });

          // API call
          //await api.post(`/messages/${conversationId}/read`);

          // Update local state
          // set((state) => ({
          //   conversations: state.conversations.map((c) =>
          //     c.id === conversationId ? { ...c, unreadCount: 0 } : c,
          //   ),
          // }));
        } catch (error) {
          console.error("[ChatStore] Mark as read error:", error);
        }
      },

      selectConversation: async (conversationId) => {
        const {
          setCurrentConversationId,
          fetchMessages,
          fetchMembers,
          markConversationAsRead,
          messages,
          members,
          setChatChosen,
        } = get();

        // set ChatChosen to true
        setChatChosen(true);

        //  Set current conversation
        setCurrentConversationId(conversationId);

        //  Mark as read
        await markConversationAsRead(conversationId);

        // Fetch messages if not loaded
        if (
          !messages[conversationId] ||
          messages[conversationId].length === 0
        ) {
          await fetchMessages(conversationId);
        }

        // Fetch members if not loaded
        if (!members[conversationId] || members[conversationId].length === 0) {
          await fetchMembers(conversationId);
        }
      },

      joinConversation: async (conversationId) => {
        const toast = useToastStore.getState();

        try {
          const response = await api.post(
            `/conversations/${conversationId}/join`,
          );
          const user = response?.data?.data;

          // Emit socket event to join real-time room
          useSocketStore.getState().emit(CLIENT.CHAT_JOIN, { conversationId });

          toast.success("Joined conversation successfully");

          //  Refresh conversations and select
          await get().fetchConversations();
          await get().selectConversation(conversationId);

          return { success: true, user };
        } catch (error) {
          console.error("[ChatStore] Join conversation error:", error);
          const message =
            error.response?.data?.message || "Failed to join conversation";
          toast.error(message);
          return { success: false, error: message };
        }
      },

      leaveConversation: async (conversationId) => {
        const toast = useToastStore.getState();

        try {
          await api.delete(`/conversations/${conversationId}/members/me`);

          toast.success("Left conversation successfully");

          // Emit socket event to leave real-time room
          useSocketStore.getState().emit(CLIENT.CHAT_LEAVE, { conversationId });

          //  Clean up local state
          get().removeConversation(conversationId);
          set({ currentConversationId: null });

          //  Refresh conversations
          await get().fetchConversations();
        } catch (error) {
          console.error("[ChatStore] Leave conversation error:", error);
          const message =
            error.response?.data?.message || "Failed to leave conversation";
          toast.error(message);
        }
      },

      // ===== Reset =====
      reset: () => {
        set({
          conversations: [],
          currentConversationId: null,
          messages: {},
          members: {},
          typingUsers: {},
          isLoading: {
            conversations: false,
            messages: false,
            members: false,
          },
          errors: {
            conversations: null,
            messages: null,
            members: null,
          },
        });
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        //  Only persist what's necessary
        currentConversationId: state.currentConversationId,
        conversations: state.conversations,
        messages: state.messages,
        members: state.members,
      }),
    },
  ),
);

// ============================================
// CUSTOM HOOKS (Selectors)
// ============================================

export const useCurrentConversation = () => {
  const conversationId = useChatStore((state) => state.currentConversationId);
  const conversations = useChatStore((state) => state.conversations);
  return conversations.find((c) => c.id === conversationId);
};

export const useCurrentMessages = () => {
  const conversationId = useChatStore((state) => state.currentConversationId);
  const messages = useChatStore((state) => state.messages[conversationId]);
  return messages || [];
};

export const useCurrentMembers = () => {
  const conversationId = useChatStore((state) => state.currentConversationId);
  const members = useChatStore((state) => state.members[conversationId]);
  return members || [];
};

export const useCurrentTypingUsers = () => {
  const conversationId = useChatStore((state) => state.currentConversationId);
  const typingUsers = useChatStore(
    (state) => state.typingUsers[conversationId],
  );
  return typingUsers || [];
};

export const useIsLoading = (key) => {
  return useChatStore((state) => state.isLoading[key]);
};

export const useError = (key) => {
  return useChatStore((state) => state.errors[key]);
};

export default useChatStore;
