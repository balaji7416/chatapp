import { validate as uuidValidate } from "uuid";
import {
  createConversation,
  findConversationById,
  findUserConversations,
  findOneToOneConversation,
  checkMemberShip,
  deleteConversation,
} from "../repositories/conversation.repo.js";
import {
  getConversationMembers,
  addMember,
  removeMember,
  isAdmin,
  leaveConversation,
} from "../repositories/conversation.member.repo.js";
import { findUserById, findUserByUsername } from "../repositories/user.repo.js";
import ApiError from "../utils/apiError.js";

const createConversationService = async (
  name,
  isGroup,
  createdBy_name,
  members_names,
) => {
  //convert usernames to id's to make it easier
  const createdBy = await findUserByUsername(createdBy_name);
  if (!createdBy) {
    throw new ApiError(400, "user-You does not exist");
  }
  const memberPromises = members_names.map(async (member) => {
    const user = await findUserByUsername(member);
    if (!user) {
      throw new ApiError(400, `user not found: ${member}`);
    }
    return user?.id;
  });

  const members = await Promise.all(memberPromises);
  const createdBy_id = createdBy?.id;

  /*check if there's already a existing conversation if it's one-one chat
    return the existing conversation if there is
  */
  if (!isGroup) {
    const otherMember = members[0] === createdBy ? members[1] : members[0];
    const existing_conversation = await findOneToOneConversation(
      createdBy,
      otherMember,
    );
    if (existing_conversation) {
      return existing_conversation;
    }
  }

  const conversation = await createConversation(
    name,
    isGroup,
    createdBy_id,
    members,
  );
  return conversation;
};

const getConversationByIdService = async (conversationId, userId) => {
  // check the user has access to the conversation
  const hasAccess = await checkMemberShip(conversationId, userId);
  if (!hasAccess) {
    throw new ApiError(403, "You don't have access to this conversation");
  }

  const conversation = await findConversationById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  return conversation;
};

const getUserConversationsService = async (userId) => {
  // check if user exists
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  const conversations = await findUserConversations(userId);
  return conversations;
};

//get conversation memebers
const getConversationMembersService = async (conversationId, userId) => {
  // check if conversation id is a valid uuid
  if (!uuidValidate(conversationId)) {
    throw new ApiError(400, "Invalid conversation id");
  }
  //check if conversation exists
  const conversation = await getConversationByIdService(conversationId, userId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  const members = await getConversationMembers(conversationId);
  return members;
};

//add member to conversation
const addMemberService = async (conversationId, userId, addedUserId) => {
  //check if conversation exists
  const conversation = await findConversationById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
  //check if user exists
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  //check if added user exists
  const addedUser = await findUserById(addedUserId);
  if (!addedUser) {
    throw new ApiError(400, "Added user does not exist");
  }

  //check if user who is adding the member is a member of the conversation
  let isMember = await checkMemberShip(conversationId, userId);
  if (!isMember) {
    throw new ApiError(403, "You are not a member of this conversation");
  }

  //check if user is already a member of the conversation
  isMember = false;
  isMember = await checkMemberShip(conversationId, addedUserId);
  if (isMember) {
    throw new ApiError(
      400,
      "added user is already a member of the conversation",
    );
  }
  const memeber = await addMember(conversationId, addedUserId);
  return memeber;
};

const removeMemberService = async (conversationId, userId, removedUserId) => {
  //check if conversation exists
  const conversation = await findConversationById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  //check if user exists
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  //check if removed user exists
  const removedUser = await findUserById(removedUserId);
  if (!removedUser) {
    throw new ApiError(400, "Removed user does not exist");
  }

  //check if removed user is a member of the conversation
  const isMember = await checkMemberShip(conversationId, removedUserId);
  if (!isMember) {
    throw new ApiError(400, "Removed user is not a member of the conversation");
  }

  //check if user has access to remove the member
  if (!(await isAdmin(conversationId, userId))) {
    throw new ApiError(403, "You don't have access to remove this member");
  }

  //prevent removing other admins
  if (
    (await isAdmin(conversationId, removedUserId)) &&
    userId !== removedUserId
  ) {
    throw new ApiError(403, "You can't remove other admins");
  }

  const removedMember = await removeMember(conversationId, removedUserId);
  return removedMember;
};

const leaveConversationService = async (conversationId, userId) => {
  //check if conversationId is a valid uui
  if (!uuidValidate(conversationId)) {
    throw new ApiError(400, "invalid conversation id");
  }

  //check if conversation exists
  const conversation = await findConversationById(conversationId);
  if (!conversation) {
    throw new ApiError(400, "conversation doesn't exist");
  }

  //check if user exists
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(400, "user- doesn't exist");
  }

  //check if user is a member of the conversation
  const isMember = await checkMemberShip(conversationId, userId);
  if (!isMember) {
    throw new ApiError(
      400,
      `user-${user?.username} is not a member of conversation-${conversation?.name}`,
    );
  }

  const result = await leaveConversation(conversationId, userId);
  return {
    conversationId: conversation?.id,
    conversationName: conversation?.name,
    leftUserId: user?.id,
    leftUsername: user?.username,
  };
};

const deleteConversationService = async (conversationId, userId) => {
  //check if conversation exists
  const conversation = await findConversationById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  //check if user exists
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  //check if user has access to delete the conversatoin
  const hasAccess = await isAdmin(conversationId, userId);
  if (!hasAccess) {
    throw new ApiError(
      403,
      "You don't have access to delete this conversation",
    );
  }

  const result = await deleteConversation(conversationId);
  return result;
};

export {
  createConversationService,
  getConversationByIdService,
  getUserConversationsService,
  getConversationMembersService,
  addMemberService,
  removeMemberService,
  leaveConversationService,
  deleteConversationService,
};
