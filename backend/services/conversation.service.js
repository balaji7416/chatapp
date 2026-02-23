import { validate as uuidValidate } from "uuid";
import {
  createConversation,
  findConversationById,
  findUserConversations,
  findOneToOneConversation,
  checkMemberShip,
} from "../repositories/conversation.repo.js";
import {
  getConversationMembers,
  addMember,
  removeMember,
  isAdmin,
} from "../repositories/conversation.member.repo.js";
import { findUserById } from "../repositories/user.repo.js";
import ApiError from "../utils/apiError.js";

const createConversationService = async (name, isGroup, createdBy, members) => {
  // check if user id is valid
  if (!uuidValidate(createdBy)) {
    throw new ApiError(400, "Invalid user id");
  }

  //check if member ids are valid
  for (const member of members) {
    if (!uuidValidate(member)) {
      throw new ApiError(400, `inavlid member id: ${member}`);
    }
  }

  //check if creator exists
  const user = await findUserById(createdBy);
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  //check if all memebers exist
  const existPromises = members.map((member) => {
    return findUserById(member);
  });

  const users = await Promise.all(existPromises);
  const missingMembers = [];
  for (let i = 0; i < members.length; i++) {
    if (!users[i]) {
      missingMembers.push(members[i]);
    }
  }

  if (missingMembers.length > 0) {
    throw new ApiError(400, `Users not found: ${missingMembers.join(", ")}`);
  }

  /*check if there's already a existing conversation if it's one-one chat
    return the existing conversation if there is
  */
  if (!isGroup) {
    const existing_conversation = await findOneToOneConversation(
      createdBy,
      members[0],
    );
    if (existing_conversation) {
      return existing_conversation;
    }
  }

  const conversation = await createConversation(
    name,
    isGroup,
    createdBy,
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

export {
  createConversationService,
  getConversationByIdService,
  getUserConversationsService,
  getConversationMembersService,
  addMemberService,
  removeMemberService,
};
