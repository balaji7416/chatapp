import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import {
  sendMessage,
  getMessages,
  deleteMessage,
  markMessagesAsRead,
  getMessageReadReceipts,
} from "../controllers/message.controller.js";

const router = Router();

router.post("/:conversationId", authenticate, sendMessage);
router.post("/:conversationId/read", authenticate, markMessagesAsRead);
router.get("/:conversationId", authenticate, getMessages);
router.delete("/:messageId", authenticate, deleteMessage);
router.get("/:messageId/read-receipts", authenticate, getMessageReadReceipts);
export default router;
