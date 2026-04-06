import { create } from "zustand";
import { persist } from "zustand/middleware";

import api from "../lib/api.js";

const useChatStore = create(
  persist(
    (set, get) => ({
      //state
      conversations: [],
      currentConversationId: null,
      messages: {}, // {conversationId: [messages]}
      members: {}, //{conversationId: [members]}

      //loading states
      isMessagesLoading: false,
      isConversationsLoading: false,
      isMembersLoading: false,

      //actions
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

        const msgs = get().messages[conversationId];
        if (!msgs || msgs.length === 0) {
          await get().fetchMessages(conversationId);
        }
        const members = get().members[conversationId];
        if (!members || members.length === 0) {
          await get().fetchMembers(conversationId);
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
export {
  useChatStore,
  useCurrentMessages,
  useCurrentConversation,
  useCurrentMembers,
};
