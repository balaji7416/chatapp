import {
  sendMessageService,
  getMesssagesService,
  deleteMessageService,
  markMessagesAsReadService,
  getMessageReadReceiptsService,
} from "../services/message.service.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { messageContent, replyToId } = req.body;

  if (!messageContent) {
    throw new ApiError(400, "message content is required");
  }

  const message = await sendMessageService(
    conversationId,
    messageContent,
    replyToId,
    req.user.id,
  );
  return res
    .status(201)
    .json(new ApiResponse(201, "message sent successfully", message));
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  if (!conversationId) {
    throw new ApiError(400, "conversation id is required");
  }

  const messages = await getMesssagesService(conversationId, req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "messages fetched successfully", messages));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  if (!messageId) {
    throw new ApiError(400, "message id is required");
  }

  const message = await deleteMessageService(messageId, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, "message deleted successfully", message));
});

const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const result = await markMessagesAsReadService(conversationId, req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, "messages marked as read", result));
});

const getMessageReadReceipts = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { conversationId } = req.query;

  const result = await getMessageReadReceiptsService(messageId, conversationId);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "message read receipts fetched successfully",
        result,
      ),
    );
});
export {
  sendMessage,
  getMessages,
  deleteMessage,
  markMessagesAsRead,
  getMessageReadReceipts,
};
