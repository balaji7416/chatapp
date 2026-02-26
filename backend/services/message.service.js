import { sendMessage, getMesssages } from "../repositories/message.repo.js";
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

export { sendMessageService, getMesssagesService };
