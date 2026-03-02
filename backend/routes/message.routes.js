import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import {
  sendMessage,
  getMessages,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.post("/:conversationId", authenticate, sendMessage);
router.get("/:conversationId", authenticate, getMessages);
router.delete("/:messageId", authenticate, deleteMessage);
export default router;
