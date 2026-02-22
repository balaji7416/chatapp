import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../services/auth.service.js";
import { findUserById } from "../repositories/user.repo.js";

const authenticate = asyncHandler(async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req?.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, "access token is missing");
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await findUserById(decoded.id);
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err === "TokenExpiredError") {
      throw new ApiError(401, "access token expired");
    }
    throw new ApiError(401, "from auth middleware : " + err.message);
  }
});

export default authenticate;
