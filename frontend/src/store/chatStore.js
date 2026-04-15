import { create } from "zustand";
import { persist } from "zustand/middleware";

import api from "../lib/api.js";
import { useToastStore } from "./toastStore.js";
import { useAuthStore } from "./authStore.js";

const useChatStore = create(
  persist(
    (set, get) => ({
      //state

      conversations: [],
      currentConversationId: null,
      messages: {}, // {conversationId: [messages]}
      members: {}, //{conversationId: [members]}
      chatAreaView: "chats", //"chats" or "chatInfo"
      typingUsers: {}, //{conversationId: [users]}
      chatChosen: false,

      //loading states
      isMessagesLoading: false,
      isConversationsLoading: false,
      isMembersLoading: false,

      //actions
      setChatAreaView: (view) => set({ chatAreaView: view }),
      setChatChosen: (value) => set({ chatChosen: value }),
      setConversations: (conversations) => set({ conversations }),
      setCurrentConversationId: (id) => set({ currentConversationId: id }),
      addMessage: (conversationId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [
              ...(state.messages[conversationId] || []),
              message,
            ],
          },
        })),
      replaceMessage: (conversationId, prevId, newMessage) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId].map((msg) =>
              msg.messageId === prevId ? { ...msg, ...newMessage } : msg,
            ),
          },
        })),
      addMember: (conversationId, member) =>
        set((state) => ({
          members: {
            ...state.members,
            [conversationId]: [
              ...(state.members[conversationId] || []),
              member,
            ],
          },
        })),
      removeMember: (conversationId, member) =>
        set((state) => ({
          members: {
            ...state.members,
            [conversationId]: state.members[conversationId]?.filter(
              (m) => m.id !== member.id,
            ),
          },
        })),

      setMembers: (conversationId, members) =>
        set((state) => ({
          members: {
            ...state.members,
            [conversationId]: members,
          },
        })),

      setMessages: (conversationId, messages) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: messages,
          },
        })),

      reset: () =>
        set({
          conversations: [],
          currentConversationId: null,
          messages: {},
          isMessagesLoading: false,
          isConversationsLoading: false,
          members: {},
        }),

      //loading actions
      setMessagesLoading: (loading) => set({ isMessagesLoading: loading }),
      setConversationsLoading: (loading) =>
        set({ isConversationsLoading: loading }),

      //api actions
      fetchConversations: async () => {
        try {
          get().setConversationsLoading(true);
          const res = await api.get("/conversations");
          get().setConversations(res.data.data);
        } catch (error) {
          console.error("Error in fetching conversations: ", error);
        } finally {
          get().setConversationsLoading(false);
        }
      },

      addTypingUser: (conversationId, user) => {
        set((state) => {
          const currUser = useAuthStore.getState().user;
          if (user?.id === currUser?.id) return state;

          const currUsers = state.typingUsers[conversationId] || [];
          //check if user is already typing
          if (currUsers.some((u) => u.id === user?.id)) return state;
          return {
            typingUsers: {
              ...state.typingUsers,
              [conversationId]: [...(currUsers || []), user],
            },
          };
        });
      },

      removeTypingUser: (conversationId, userId) => {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: (state.typingUsers[conversationId] || [])?.filter(
              (u) => u.id !== userId,
            ),
          },
        }));
      },

      fetchMessages: async (conversationId) => {
        try {
          get().setMessagesLoading(true);
          const res = await api.get(`/messages/${conversationId}`);
          get().setMessages(conversationId, res.data.data);
        } catch (error) {
          console.error("Error in fetching messages: ", error);
        } finally {
          get().setMessagesLoading(false);
        }
      },

      sendMessage: async (conversationId, content) => {
        const { error: showError } = useToastStore.getState();
        try {
          const res = await api.post(`/messages/${conversationId}`, {
            messageContent: content,
          });
          const msg = res.data.data;
          return msg;
        } catch (error) {
          showError("Failed to send message");
          console.error("Error in sending message: ", error);
          return null;
        }
      },

      fetchMembers: async (conversationId) => {
        try {
          set({ isMembersLoading: true });
          const res = await api.get(`/conversations/${conversationId}/members`);
          get().setMembers(conversationId, res?.data?.data);
          console.log("Members: ", res?.data?.data);
        } catch (error) {
          console.error("Error in fetching members: ", error);
        } finally {
          set({ isMembersLoading: false });
        }
      },

      selectConversation: async (conversationId) => {
        get().setCurrentConversationId(conversationId);
        get().setChatAreaView("chats");
        get().setChatChosen(true);
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unread_count: 0 } : c,
          ),
        }));
        const msgs = get().messages[conversationId];
        if (!msgs || msgs.length === 0) {
          await get().fetchMessages(conversationId);
        }
        const members = get().members[conversationId];
        if (!members || members.length === 0) {
          await get().fetchMembers(conversationId);
        }

        try {
          await api.post(`/messages/${conversationId}/read`);
        } catch (error) {
          console.error("Error in marking messages as read: ", error);
        }
      },

      leaveConversation: async (conversationId) => {
        const { success: showSuccess, error: showError } =
          useToastStore.getState();
        try {
          await api.delete(`/conversations/${conversationId}/members/me`);
          showSuccess("Left conversation successfully");
          get().setConversations(
            get().conversations.filter((c) => c.id !== conversationId),
          );
          get().setCurrentConversationId(null);
          get().setMessages(conversationId, []);
          get().setMembers(conversationId, []);
        } catch (error) {
          const msg =
            error.response?.data?.message || error.message || "Unknown error";
          showError(msg);
          console.error("Error in leaving conversation: ", error);
        }
      },

      joinConversation: async (conversationId) => {
        const { error: showError, success: showSuccess } =
          useToastStore.getState();

        try {
          const res = await api.post(`/conversations/${conversationId}/join`);
          const user = res?.data?.data;

          get().addMember(conversationId, user);
          showSuccess("Joined conversation successfully");

          get().fetchConversations();

          /*select conversation handles - 
            - set current conversation id
            - set view to chats
            - fetch messages
            - fetch members
          */
          await get().selectConversation(conversationId);
          return {
            success: true,
            user,
          };
        } catch (error) {
          const msg =
            error.response?.data?.message || error.message || "Unknown error";
          showError(msg);
          console.error("Error in joining conversation: ", error);
          return {
            success: false,
            error: msg,
          };
        }
      },
    }),

    {
      name: `chat-storage`,

      // Partial state to persist
      partialize: (state) => ({
        //conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        //messages: state.messages,
      }),
    },
  ),
);

const useCurrentMessages = () => {
  const currConvId = useChatStore((state) => state.currentConversationId);
  const messages = useChatStore((state) =>
    currConvId ? state.messages[currConvId] : undefined,
  );
  return messages ?? [];
};

const useCurrentConversation = () => {
  const currConvId = useChatStore((state) => state.currentConversationId);
  const conversations = useChatStore((state) => state.conversations);
  return conversations.find((c) => c.id === currConvId);
};

const useCurrentMembers = () => {
  const currConvId = useChatStore((state) => state.currentConversationId);
  const members = useChatStore((state) => state.members[currConvId]);
  return members ?? [];
};

const useCurrentTypingUsers = () => {
  const currConvId = useChatStore((state) => state.currentConversationId);
  const typingUsers = useChatStore((state) => state.typingUsers[currConvId]);
  return typingUsers ?? [];
};
export {
  useChatStore,
  useCurrentMessages,
  useCurrentConversation,
  useCurrentMembers,
  useCurrentTypingUsers,
};
