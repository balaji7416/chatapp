import {
  createConversationService,
  getConversationByIdService,
  getUserConversationsService,
  getConversationMembersService,
  addMemberService,
  removeMemberService,
  leaveConversationService,
  deleteConversationService,
} from "../services/conversation.service.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const createConversation = asyncHandler(async (req, res) => {
  const { name, isGroup, members } = req.body;

  if (!name && isGroup) {
    throw new ApiError(400, "group chat requires a name");
  }

  const uniqueMembers = [...new Set([req.user.id, ...members])];
  if (uniqueMembers.length < 2) {
    const errMsg =
      uniqueMembers.length === 1
        ? "cannot create chat with yourself"
        : "chat requires at least 2 different members";
    throw new ApiError(400, errMsg);
  }

  const conversation = await createConversationService(
    name,
    isGroup,
    req.user.id,
    uniqueMembers,
  );
  return res
    .status(201)
    .json(
      new ApiResponse(201, "conversation created successfully", conversation),
    );
});

const getConversationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conversation = await getConversationByIdService(id, req.user.id);
  return res
    .status(200)
    .json(
      new ApiResponse(200, "conversation fetched successfully", conversation),
    );
});

const getUserConversations = asyncHandler(async (req, res) => {
  const getUserConversations = await getUserConversationsService(req.user.id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `user-${req.user.username} conversations fetched successfully`,
        getUserConversations,
      ),
    );
});

const getConversationMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const memebers = await getConversationMembersService(id, req.user.id);
  if (!memebers) {
    throw new ApiError(404, "members not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `conversation-${memebers[0]?.conversation_name || id} members fetched successfully`,
        memebers,
      ),
    );
});

//add member to conversation
const addMember = asyncHandler(async (req, res) => {
  const { conversationId, userIdToAdd } = req.params;
  if (!conversationId) {
    throw new ApiError(400, "conversation id is required");
  }
  if (!userIdToAdd) {
    throw new ApiError(400, "added user id is required");
  }
  const member = await addMemberService(
    conversationId,
    req.user.id,
    userIdToAdd,
  );
  return res
    .status(201)
    .json(
      new ApiResponse(201, `member added to conversation successfully`, member),
    );
});

const removeMember = asyncHandler(async (req, res) => {
  const { conversationId, userIdToRemove } = req.params;
  if (!conversationId) {
    throw new ApiError(400, "conversation id is required");
  }
  if (!userIdToRemove) {
    throw new ApiError(400, "user id to remove is required");
  }

  const member = await removeMemberService(
    conversationId,
    req.user.id,
    userIdToRemove,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "member removed successfully", member));
});

const leaveConversation = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  if (!conversationId) {
    throw new ApiError(400, "conversationId is required");
  }
  const result = await leaveConversationService(conversationId, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, "user left conversation successfully", result));
});

const deleteConversation = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  if (!conversationId) {
    throw new ApiError(400, "conversationId is required");
  }
  const result = await deleteConversationService(conversationId, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, "conversation deleted", result));
});

export {
  createConversation,
  getConversationById,
  getUserConversations,
  getConversationMembers,
  addMember,
  removeMember,
  leaveConversation,
  deleteConversation,
};
