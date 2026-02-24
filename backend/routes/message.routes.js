import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.post("/:conversationId", authenticate, sendMessage);

export default router;
