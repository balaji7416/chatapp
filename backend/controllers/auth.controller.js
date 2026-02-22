import asyncHandler from "../utils/asyncHandler.js";
import {
  registerUserService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
} from "../services/auth.service.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  //validation
  if (!username) {
    throw new ApiError(400, "Username is required");
  }
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  //register user / add user to db if not exist
  const { user, access_token, refresh_token } = await registerUserService({
    username,
    email,
    password,
  });

  //set cookies
  res.cookie("refreshToken", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("accessToken", access_token, {
    httpOnly: false, //js can access
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  //send response
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

  //validation
  if (!email) {
    throw new ApiError(400, "email is required");
  }
  if (!password) {
    throw new ApiError(400, "password is missing");
  }

  //login user
  const { user, access_token, refresh_token } = await loginUserService(
    email,
    password,
  );

  //set cookies
  res.cookie("refreshToken", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("accessToken", access_token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  //send response
  return res.status(200).json(
    new ApiResponse(200, "User logged in successfully", {
      user,
      access_token,
      refresh_token,
    }),
  );
});

//logout
const logOutUser = asyncHandler(async (req, res) => {
  const { id } = req.user;

  if (!id) {
    throw new ApiError(401, "Unauthorized");
  }

  //clear refreshtoken in db
  await logoutUserService(id);

  //clear cookies sent to client
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully"));
});

//refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  let refresh_token = req.cookies.refreshToken;

  //check if refresh token is sent in header
  if (!refresh_token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      refresh_token = authHeader.split(" ")[1];
    }
  }

  //if refresh token is not found in cookie or header
  if (!refresh_token) {
    throw new ApiError(
      401,
      "Refresh token is missing for access token refresh",
    );
  }

  //generate new access & refresh tokens
  const { access_token, refresh_token: newRefreshToken } =
    await refreshAccessTokenService(refresh_token);

  //set cookies
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("accessToken", access_token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  // send access token, refresh token in res for client to use
  return res.status(200).json(
    new ApiResponse(200, "Access token refreshed successfully", {
      access_token,
      refresh_token: newRefreshToken,
    }),
  );
});

// export
export { registerUser, loginUser, logOutUser, refreshAccessToken };
