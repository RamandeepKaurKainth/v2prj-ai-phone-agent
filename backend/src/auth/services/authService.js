const crypto = require("crypto");
const userModel = require("../models/userModel");
const passwordResetModel = require("../models/passwordResetModel");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken, verifyToken } = require("../utils/jwt");
const { sendPasswordResetEmail } = require("../../services/emailService");

const register = async (email, password) => {
  const existingUser = await userModel.findUserByEmail(email);

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await userModel.createUser(email, hashedPassword);

  return newUser;
};

const login = async (email, password) => {
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
  const sqlRole = await userModel.getUserRole(userId);

  if (!sqlRole) {
    throw new Error("User role not found");
  }

  const role = sqlRole.role_id;
  let info = {};

  if (role === 2) {
    const selfInfo = await userModel.getRemainingTimesByID(userId);

    info = {
      userId,
      type: "user",
      self: selfInfo
    };
  } else if (role === 1) {
    const selfInfo = await userModel.getRemainingTimesByID(userId);
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
  console.log("forgotPassword started");
  console.log("Email received:", email);

  const user = await userModel.findUserByEmail(email);
  console.log("User lookup result:", user ? "FOUND" : "NOT FOUND");

  if (!user) {
    throw new Error("No account found with that email");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  console.log("Reset token generated");

  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
  console.log("Expiry set:", expiresAt);

  await passwordResetModel.createResetToken(user.id, resetToken, expiresAt);
  console.log("Reset token saved in database");

  const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;
  console.log("Reset link created:", resetLink);

  console.log("About to send password reset email...");
  await sendPasswordResetEmail(user.email, resetLink);
  console.log("Password reset email sent successfully");

  return {
    message: "Password reset email sent successfully"
  };
};

const resetPassword = async (token, newPassword) => {
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