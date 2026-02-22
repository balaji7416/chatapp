import { Router } from "express";

import {
  createConversation,
  getConversationById,
  getUserConversations,
  getConversationMembers,
} from "../controllers/conversation.controller.js";
import authenticate from "../middleware/auth.middleware.js";
const router = Router();

router.post("/", authenticate, createConversation);
router.get("/:id", authenticate, getConversationById);
router.get("/", authenticate, getUserConversations);
router.get("/:id/members", authenticate, getConversationMembers);

export default router;
