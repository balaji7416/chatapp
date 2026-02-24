import { sendMessageService } from "../services/message.service.js";
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

export { sendMessage };
