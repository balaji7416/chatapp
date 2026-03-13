// Events server recieves(Incoming)
const INCOMING = {
  SEND_MESSAGE: "client:send_message",
  JOIN_CHAT: "client:join_chat",
  START_TYPING: "client:start_typing",
};

//Events server emits
const OUTGOING = {
  NEW_MESSAGE: "server:new_message",
  USER_ONLINE: "server:user_online",
  SESSION_EXPIRED: "server:session_expired",
  ERROR_OCCURRED: "server:error",
};

const INTERNAL = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
};

export { INCOMING, OUTGOING, INTERNAL };
