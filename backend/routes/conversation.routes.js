import { Router } from "express";

import {
  createConversation,
  joinConversation,
  getConversationById,
  getUserConversations,
  getConversationMembers,
  addMember,
  removeMember,
  leaveConversation,
  deleteConversation,
} from "../controllers/conversation.controller.js";
import authenticate from "../middleware/auth.middleware.js";
const router = Router();

router.post("/", authenticate, createConversation); // create a conversation
router.post("/:conversationId/members/:userIdToAdd", authenticate, addMember); //add a single member
router.post("/:conversationId/join", authenticate, joinConversation); //join a conversation
router.get("/:id", authenticate, getConversationById); // get conversation by id
router.get("/", authenticate, getUserConversations); // get user conversations
router.get("/:id/members", authenticate, getConversationMembers); //get conversation members

router.delete("/:id/members/me", authenticate, leaveConversation); //leave conversation

router.delete(
  "/:conversationId/members/:userIdToRemove",
  authenticate,
  removeMember,
);
router.delete("/:id", authenticate, deleteConversation);

export default router;
