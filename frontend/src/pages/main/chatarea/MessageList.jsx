import { useEffect, useRef } from "react";
import { SERVER } from "../../../lib/events.js";

import { useChatStore, useCurrentMessages } from "../../../store/chatStore.js";
import { useSocketStore } from "../../../store/socketStore.js";

import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
function MessageList() {
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const currentConvId = useChatStore((state) => state.currentConversationId);
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const addTypingUser = useChatStore((state) => state.addTypingUser);
  const removeTypingUser = useChatStore((state) => state.removeTypingUser);
  const on = useSocketStore((state) => state.on);
  const isConnected = useSocketStore((state) => state.isConnected);

  const msgsEndRef = useRef(null);

  //fetch messaegs on reload
  useEffect(() => {
    if (!currentConvId) return;
    fetchMessages(currentConvId);
  }, [fetchMessages, currentConvId]);

  const messages = useCurrentMessages();

  //auto scroll to new mesg
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // mount handlers for socket events
  useEffect(() => {
    if (!isConnected) {
      console.log("socket not connected, skipping socket events mount");
      return;
    }
    const onMessage = (res) => {
      const message = res.data;
      const conversationId = message?.conversationId;
      addMessage(conversationId, message);
    };
    const onTypingStart = ({ data }) => {
      if (data.conversationId === currentConvId && data.user) {
        //console.log(`${data.user?.username} started typing`);
        addTypingUser(data.conversationId, data.user);
      }

      //auto remove typing user after 3 seconds (if stop event not received)
      setTimeout(() => {
        removeTypingUser(data.conversationId, data.user?.id);
      }, 3000);
    };

    const onTypingStop = ({ data }) => {
      if (data.conversationId === currentConvId && data.user) {
        //console.log(`${data.user?.username} stopped typing`);
        removeTypingUser(data.conversationId, data.user?.id);
      }
    };
    const cleanupMessage = on(SERVER.NEW_MESSAGE, onMessage);
    const cleanUpTypingStart = on(SERVER.TYPING_START, onTypingStart);
    const cleanUpTypingStop = on(SERVER.TYPING_STOP, onTypingStop);
    return () => {
      cleanupMessage();
      cleanUpTypingStart();
      cleanUpTypingStop();
    };
  }, [
    on,
    addMessage,
    isConnected,
    currentConvId,
    addTypingUser,
    removeTypingUser,
  ]);

  //socket event handlers
  if (!currentConvId)
    return (
      <div className="h-full flex items-center justify-center text-base-content/55 font-semibold">
        select a conversation to start chatting
      </div>
    );
  if (isMessagesLoading)
    return (
      <div className="flex items-center justify-center text-base-content/55 font-semibold">
        messages loading ...
      </div>
    );
  if (messages.length === 0)
    return (
      <div className="h-full flex items-center justify-center text-base-content/55 font-semibold">
        No messages
      </div>
    );
  return (
    <div className="h-full p-4 pb-16 overflow-y-auto space-y-2">
      {messages.map((m) => (
        <MessageBubble key={m.messageId || m.id} message={m} />
      ))}
      <TypingIndicator />
      {/*for auto scroll to new mesg */}
      <div ref={msgsEndRef}></div>
    </div>
  );
}

export default MessageList;
