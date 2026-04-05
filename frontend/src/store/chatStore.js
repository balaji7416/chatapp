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

      //loading states
      isMessagesLoading: false,
      isConversationsLoading: false,

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

      selectConversation: async (conversationId) => {
        get().setCurrentConversationId(conversationId);

        const msgs = get().messages[conversationId];
        if (!msgs || msgs.length === 0) {
          await get().fetchMessages(conversationId);
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

export { useChatStore, useCurrentMessages, useCurrentConversation };
