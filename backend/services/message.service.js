import {
  sendMessage,
  getMesssages,
  isOwnerOfMessage,
  deleteMessage,
  getMessage,
  markMessagesAsRead,
  getMessageReadReceipts,
} from "../repositories/message.repo.js";
import { isAdmin } from "../repositories/conversation.member.repo.js";
import { findConversationById } from "../repositories/conversation.repo.js";
import { checkMemberShip } from "../repositories/conversation.repo.js";
import ApiError from "../utils/apiError.js";

const sendMessageService = async (
  conversation_id,
  message_content,
  reply_to_id,
  user_id,
) => {
  //check if conversation exists
  const conversation = await findConversationById(conversation_id);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  //check if user is a member of conversation
  const isMember = await checkMemberShip(conversation_id, user_id);
  if (!isMember) {
    throw new ApiError(403, "You are not a member of this conversation");
  }

  //check if reply_to_id is valid
  if (reply_to_id) {
    const isMember = await checkMemberShip(conversation_id, reply_to_id);
    if (!isMember) {
      throw new ApiError(
        403,
        "reply to user is not a member of this conversation",
      );
    }
  }

  const message = await sendMessage(
    conversation_id,
    user_id,
    reply_to_id,
    message_content,
  );

  return message;
};

const getMesssagesService = async (conversation_id, user_id) => {
  const conversation = await findConversationById(conversation_id);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  const isMember = await checkMemberShip(conversation_id, user_id);
  if (!isMember) {
    throw new ApiError(403, "You are not a member of this conversation");
  }

  const messages = await getMesssages(conversation_id);
  return messages;
};

const deleteMessageService = async (message_id, user_id) => {
  const message = await getMessage(message_id);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }
  const conversation_id = message?.conversation_id;
  const isOwner = await isOwnerOfMessage(message_id, user_id);
  const is_admin = await isAdmin(conversation_id, user_id);
  if (!isOwner && !is_admin) {
    throw new ApiError(403, "You are not the owner of this message");
  }

  const result = await deleteMessage(message_id);
  return result;
};
const markMessagesAsReadService = async (conversation_id, user_id) => {
  const conversation = await findConversationById(conversation_id);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isMember = await checkMemberShip(conversation_id, user_id);
  if (!isMember) {
    throw new ApiError(403, "You are not a member of this conversation");
  }

  const result = await markMessagesAsRead(conversation_id, user_id);
  return result;
};

const getMessageReadReceiptsService = async (msg_id, conv_id) => {
  //check if conversation exists
  const conversation = await findConversationById(conv_id);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const result = await getMessageReadReceipts(msg_id, conv_id);
  return result;
};

export {
  sendMessageService,
  getMesssagesService,
  deleteMessageService,
  markMessagesAsReadService,
  getMessageReadReceiptsService,
};
