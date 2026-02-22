import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticate, logOutUser);
router.post("/refresh", refreshAccessToken);

export default router;
