import {
  createConversationService,
  getConversationByIdService,
  getUserConversationsService,
  getConversationMembersService,
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
        `conversation-${id} members fetched successfully`,
        memebers,
      ),
    );
});

export {
  createConversation,
  getConversationById,
  getUserConversations,
  getConversationMembers,
};
