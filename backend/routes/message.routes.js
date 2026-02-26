import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";

const router = Router();

router.post("/:conversationId", authenticate, sendMessage);
router.get("/:conversationId", authenticate, getMessages);
export default router;
