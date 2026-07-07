import asyncHandler from "../utils/asyncHandler.js";
import {
  registerUserService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
} from "../services/auth.service.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { setAuthCookies } from "../utils/cookieUtils.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username) throw new ApiError(400, "Username is required");
  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");

  const { user, accessToken, refreshToken } = await registerUserService({
    username,
    email,
    password,
  });

  setAuthCookies(res, { accessToken, refreshToken });

  return res.status(200).json(
    new ApiResponse(200, "User registered successfully", {
      user,
      accessToken,
      refreshToken,
    }),
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw new ApiError(400, "email is required");
  if (!password) throw new ApiError(400, "password is missing");

  const { user, accessToken, refreshToken } = await loginUserService(
    email,
    password,
  );

  setAuthCookies(res, { accessToken, refreshToken });

  return res.status(200).json(
    new ApiResponse(200, "User logged in successfully", {
      user,
      accessToken,
      refreshToken,
    }),
  );
});

const logOutUser = asyncHandler(async (req, res) => {
  const refreshToken = req?.cookies.refreshToken;
  if (!refreshToken) {
    return res
      .status(200)
      .json(new ApiResponse(200, "user already logged out"));
  }

  await logoutUserService(refreshToken);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  let refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      refreshToken = authHeader.split(" ")[1];
    }
  }

  if (!refreshToken) {
    throw new ApiError(
      401,
      "Refresh token is missing for access token refresh",
    );
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshAccessTokenService(refreshToken);

  setAuthCookies(res, { accessToken, refreshToken: newRefreshToken });

  return res.status(200).json(
    new ApiResponse(200, "Access token refreshed successfully", {
      accessToken,
      refreshToken: newRefreshToken,
    }),
  );
});

export { registerUser, loginUser, logOutUser, refreshAccessToken };
