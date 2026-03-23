const crypto = require("crypto");
const userModel = require("../models/userModel");
const passwordResetModel = require("../models/passwordResetModel");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken, verifyToken } = require("../utils/jwt");
const { sendPasswordResetEmail } = require("../../services/emailService");

const register = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const existingUser = await userModel.findUserByEmail(email);

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await userModel.createUser(email, hashedPassword);

  return newUser;
};

const login = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await userModel.findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  return token;
};

const verify = async (req) => {
  const payload = verifyToken(req);

  if (!payload) {
    throw new Error("Token invalid or missing");
  }

  const userId = payload.userId;
  const role = await userModel.getUserRole(userId);

  if (!role) {
    throw new Error("User role not found");
  }

  let info = {};

  if (role === 2) {
    const selfInfo = await userModel.getRemainingCallsById(userId);

    info = {
      userId,
      type: "user",
      self: selfInfo
    };
  } else if (role === 1) {
    const selfInfo = await userModel.getRemainingCallsById(userId);
    const fullInfo = await userModel.listAllUserUsage();

    info = {
      userId,
      type: "admin",
      self: selfInfo,
      users: fullInfo
    };
  } else {
    throw new Error("Unknown role");
  }

  return info;
};

const forgotPassword = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await userModel.findUserByEmail(email);

  if (!user) {
    return {
      message: "If an account exists, a reset link has been sent."
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await passwordResetModel.createResetToken(user.id, resetToken, expiresAt);

  if (!process.env.FRONTEND_URL) {
    throw new Error("Missing FRONTEND_URL");
  }

  const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;

  await sendPasswordResetEmail(user.email, resetLink);

  return {
    message: "If an account exists, a reset link has been sent."
  };
};

const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new Error("Token and new password are required");
  }

  const resetEntry = await passwordResetModel.findValidToken(token);

  if (!resetEntry) {
    throw new Error("Reset token is invalid or expired");
  }

  const hashedPassword = await hashPassword(newPassword);
  await userModel.updatePasswordById(resetEntry.user_id, hashedPassword);
  await passwordResetModel.deleteToken(token);

  return {
    message: "Password reset successfully"
  };
};

module.exports = {
  register,
  login,
  verify,
  forgotPassword,
  resetPassword
};