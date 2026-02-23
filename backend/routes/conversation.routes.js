import { Router } from "express";

import {
  createConversation,
  getConversationById,
  getUserConversations,
  getConversationMembers,
  addMember,
  removeMember,
  leaveConversation,
} from "../controllers/conversation.controller.js";
import authenticate from "../middleware/auth.middleware.js";
const router = Router();

router.post("/", authenticate, createConversation); // create a conversation
router.post("/:conversationId/members/:userIdToAdd", authenticate, addMember); //add a single member

router.get("/:id", authenticate, getConversationById); // get conversation by id
router.get("/", authenticate, getUserConversations); // get user conversations
router.get("/:id/members", authenticate, getConversationMembers); //get conversation members

router.delete("/:id/members/me", authenticate, leaveConversation); //leave conversation
export default router;

router.delete(
  "/:conversationId/members/:userIdToRemove",
  authenticate,
  removeMember,
);
