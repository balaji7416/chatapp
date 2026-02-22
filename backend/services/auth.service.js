import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  findUserByEmail,
  findUserByToken,
  createUser,
  updateRefreshToken,
  findUserById,
} from "../repositories/user.repo.js";
import ApiError from "../utils/apiError.js";

// generate access & refresh tokens
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
};

//register user
const registerUserService = async ({ username, email, password }) => {
  const existing_user = await findUserByEmail(email);
  if (existing_user) {
    throw new ApiError(409, "User already exists");
  }
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  const user = await createUser({ username, email, password_hash });
  const access_token = generateAccessToken(user.id);
  const refresh_token = generateRefreshToken(user.id);

  await updateRefreshToken(user.id, refresh_token);
  return { user, access_token, refresh_token };
};

//login user service
const loginUserService = async (email, password) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  const access_token = generateAccessToken(user.id);
  const refresh_token = generateRefreshToken(user.id);
  await updateRefreshToken(user.id, refresh_token);

  return { user, access_token, refresh_token };
};

//logout user
const logoutUserService = async (id) => {
  //check if use is logged in
  const user = await findUserById(id);
  if (user.refresh_token === null) {
    throw new ApiError(400, "User already logged out");
  }
  await updateRefreshToken(id, null);
};

const refreshAccessTokenService = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new ApiError(
        401,
        "jwt verify error : Refresh token expired. please login again",
      );
    }
    throw new ApiError(401, "jwt verify error : Invalid refresh token");
  }

  //get user by decoded id
  const user = await findUserById(decoded.id);
  if (!user) {
    throw new ApiError(401, "user account no longer exists");
  }

  //verify this token hasn't been revoked
  if (user.refresh_token !== token) {
    throw new ApiError(
      401,
      "session expired. login again. (token already revoked)",
    );
  }

  //generate new tokens and update the refresh token in db
  const access_token = generateAccessToken(user.id);
  const refresh_token = generateRefreshToken(user.id);
  await updateRefreshToken(user.id, refresh_token);

  return { access_token, refresh_token };
};

export {
  registerUserService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
  verifyAccessToken,
  verifyRefreshToken,
};
