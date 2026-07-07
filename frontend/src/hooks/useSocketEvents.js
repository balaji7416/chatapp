// hooks/useSocketEvents.js
import { useEffect, useRef } from "react";
import { SERVER } from "../lib/events.js";
import { useChatStore } from "../store/chatStore.js";
import { useSocketStore } from "../store/socketStore.js";
import { useAuthStore } from "../store/authStore.js";
import { useToastStore } from "../store/toastStore.js";

//Centralized socket event listeners
// Mounted once at the app root

export function useSocketEvents() {
  const isConnected =
    useSocketStore((state) => state.connectionState) === "connected";
  const on = useSocketStore((state) => state.on);
  const socket = useSocketStore((state) => state.socket);

  const user = useAuthStore((state) => state.user);
  const currentConvId = useChatStore((state) => state.currentConversationId);

  // Store actions
  const addMessage = useChatStore((state) => state.addMessage);
  const addTypingUser = useChatStore((state) => state.addTypingUser);
  const removeTypingUser = useChatStore((state) => state.removeTypingUser);
  const updateMemberLastRead = useChatStore(
    (state) => state.updateMemberLastRead,
  );
  const markAsRead = useChatStore((state) => state.markConversationAsRead);
  const addMember = useChatStore((state) => state.addMember);
  const removeMember = useChatStore((state) => state.removeMember);
  const addConversation = useChatStore((state) => state.addConversation);
  const removeConversation = useChatStore((state) => state.removeConversation);

  const showInfo = useToastStore((state) => state.info);
  const showError = useToastStore((state) => state.error);

  // Refs for current values (to avoid dependency issues)
  const currentConvIdRef = useRef(currentConvId);
  const userRef = useRef(user);

  useEffect(() => {
    currentConvIdRef.current = currentConvId;
    userRef.current = user;
  }, [currentConvId, user]);

  useEffect(() => {
    if (!isConnected || !socket) {
      console.log("[SocketEvents] Socket not connected, skipping listeners");
      return;
    }

    console.log("[SocketEvents] Setting up socket listeners");

    // MESSAGE EVENTS

    /*
     * SERVER.MESSAGE_NEW - New message received
     */
    const handleNewMessage = (data) => {
      // Normalize socket payload to match DB schema
      const message = {
        ...data,
        id: data.id || data.messageId,
        user_id: data.user_id || data.userId,
        created_at: data.created_at || data.createdAt,
      };

      const conversationId = message?.conversationId;

      if (!conversationId) {
        console.warn("[SocketEvents] Message without conversationId:", message);
        return;
      }

      //console.log("[SocketEvents] New message:", message);
      // Add message to store
      addMessage(conversationId, message);

      const currentUser = useAuthStore.getState().user;
      const currConvId = useChatStore.getState().currentConversationId;

      useChatStore.setState((state) => {
        const updatedConversations = state.conversations.map((conv) => {
          if (conv.id !== conversationId) return conv;

          const shouldIncremented =
            message.user_id !== currentUser?.id &&
            conversationId !== currConvId;

          return {
            ...conv,
            last_message: message,
            last_message_at: message.created_at,
            unreadCount: shouldIncremented
              ? Number(conv.unreadCount ?? conv.unread_count ?? 0) + 1
              : Number(conv.unreadCount),
            unread_count: shouldIncremented
              ? Number(conv.unread_count ?? conv.unreadCount ?? 0) + 1
              : Number(conv.unread_count),
          };
        });

        return {
          conversations: updatedConversations,
        };
      });

      // Auto-mark as read if in current conversation
      if (conversationId === currentConvIdRef.current && userRef.current?.id) {
        const readAt = message.created_at || new Date().toISOString();
        updateMemberLastRead(conversationId, userRef.current.id, readAt);
        markAsRead(conversationId);
      }
    };

    /**
     * SERVER.MESSAGE_READ - Message read receipt
     */
    const handleMessageRead = (data) => {
      // console.log("[SocketEvents] Message read:", data);
      if (data?.conversationId && data?.userId) {
        const readAt =
          data.lastReadAt || data.last_read_at || new Date().toISOString;
        updateMemberLastRead(data.conversationId, data.userId, readAt);
      }
    };

    // ============================================
    // TYPING EVENTS
    // ============================================

    /**
     * SERVER.TYPING_START - User started typing
     */
    const handleTypingStart = (data) => {
      if (!data.conversationId || !data.user) {
        console.warn("[SocketEvents] Invalid typing start event:", data);
        return;
      }
      addTypingUser(data.conversationId, data.user);
      // Auto-remove after 3 seconds as fallback
      setTimeout(() => {
        removeTypingUser(data.conversationId, data.user?.id);
      }, 3000);
    };

    /**
     * SERVER.TYPING_STOP - User stopped typing
     */
    const handleTypingStop = (data) => {
      if (data.conversationId === currentConvIdRef.current && data.user) {
        removeTypingUser(data.conversationId, data.user?.id);
      }
    };

    // ============================================
    // CHAT EVENTS
    // ============================================

    /**
     * SERVER.CHAT_JOINED - User joined a chat
     */
    const handleChatJoined = (data) => {
      //console.log("[SocketEvents] Chat joined:", data);
      if (data?.message) showInfo(data.message);
      console.log("[SocketEvents] Chat joined:", data);
      if (data?.conversationId && data?.user) {
        addMember(data.conversationId,data.user);
      }
    };

    /**
     * SERVER.CHAT_LEFT - User left a chat
     */
    const handleChatLeft = (data) => {
      //console.log("[SocketEvents] Chat left:", data);
      if (data?.message) showInfo(data.message);
      console.log("[SocketEvents] Chat left:", data);
      if (data?.conversationId && data?.user) {
        removeMember(data.conversationId, data.user);
      }
    };

    /**
     * SERVER.CHAT_CREATED - New chat created
     */
    const handleChatCreated = (data) => {
      //console.log("[SocketEvents] Chat created:", data);
      if (data?.conversation) {
        addConversation(data.conversation);
        showInfo(`New chat created: ${data.conversation.name}`);
      }
    };

    // ============================================
    // USER PRESENCE EVENTS
    // ============================================

    // ============================================
    // SYSTEM EVENTS
    // ============================================

    /**
     * SERVER.ERROR - Server error
     */
    const handleServerError = (data) => {
      console.error("[SocketEvents] Server error:", data);
      showError(data?.error || "An error occurred");
    };

    /**
     * SERVER.SESSION_EXPIRED - Session expired
     */
    const handleSessionExpired = (data) => {
      console.warn("[SocketEvents] Session expired:", data);
      showError("Your session has expired. Please login again.");
      // Redirect to login
      // useAuthStore.getState().logout();
    };

    // ============================================
    // REGISTER ALL LISTENERS
    // ============================================

    const cleanupMessageNew = on(SERVER.MESSAGE_NEW, handleNewMessage);
    const cleanupMessageRead = on(SERVER.MESSAGE_READ, handleMessageRead);

    const cleanupTypingStart = on(SERVER.TYPING_START, handleTypingStart);
    const cleanupTypingStop = on(SERVER.TYPING_STOP, handleTypingStop);

    const cleanupChatJoined = on(SERVER.CHAT_JOINED, handleChatJoined);
    const cleanupChatLeft = on(SERVER.CHAT_LEFT, handleChatLeft);
    const cleanupChatCreated = on(SERVER.CHAT_CREATED, handleChatCreated);

    const cleanupServerError = on(SERVER.ERROR, handleServerError);
    const cleanupSessionExpired = on(
      SERVER.SESSION_EXPIRED,
      handleSessionExpired,
    );

    console.log("[Socket] Socket listeners registered");

    // ============================================
    // CLEANUP
    // ============================================

    return () => {
      console.log("[SocketEvents] Cleaning up socket listeners");

      cleanupMessageNew();
      cleanupMessageRead();

      cleanupTypingStart();
      cleanupTypingStop();

      cleanupChatJoined();
      cleanupChatLeft();
      cleanupChatCreated();

      cleanupServerError();
      cleanupSessionExpired();
    };
  }, [
    isConnected,
    socket,
    on,
    addMessage,
    addTypingUser,
    removeTypingUser,
    updateMemberLastRead,
    markAsRead,
    addMember,
    removeMember,
    addConversation,
    removeConversation,
    showInfo,
    showError,
  ]);
}
