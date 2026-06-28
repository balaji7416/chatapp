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

  const { user, access_token, refresh_token } = await registerUserService({
    username,
    email,
    password,
  });

  setAuthCookies(res, { access_token, refresh_token });

  return res.status(200).json(
    new ApiResponse(200, "User registered successfully", {
      user,
      access_token,
      refresh_token,
    }),
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw new ApiError(400, "email is required");
  if (!password) throw new ApiError(400, "password is missing");

  const { user, access_token, refresh_token } = await loginUserService(
    email,
    password,
  );

  setAuthCookies(res, { access_token, refresh_token });

  return res.status(200).json(
    new ApiResponse(200, "User logged in successfully", {
      user,
      access_token,
      refresh_token,
    }),
  );
});

const logOutUser = asyncHandler(async (req, res) => {
  const refreshToken = req?.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(200).json(new ApiResponse(200, "user already logged out"));
  }

  await logoutUserService(refreshToken);

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  return res.status(200).json(new ApiResponse(200, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  let refresh_token = req.cookies.refreshToken;

  if (!refresh_token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      refresh_token = authHeader.split(" ")[1];
    }
  }

  if (!refresh_token) {
    throw new ApiError(401, "Refresh token is missing for access token refresh");
  }

  const { access_token, refresh_token: newRefreshToken } =
    await refreshAccessTokenService(refresh_token);

  setAuthCookies(res, { access_token, refresh_token: newRefreshToken });

  return res.status(200).json(
    new ApiResponse(200, "Access token refreshed successfully", {
      access_token,
      refresh_token: newRefreshToken,
    }),
  );
});

export { registerUser, loginUser, logOutUser, refreshAccessToken };
