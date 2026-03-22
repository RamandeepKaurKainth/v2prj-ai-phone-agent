const userModel = require("../models/userModel");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken, verifyToken } = require("../utils/jwt");

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
      type: "user",
      self: selfInfo
    };
  } else if (role === 1) {
    const selfInfo = await userModel.getRemainingTimesByID(userId);
    const fullInfo = await userModel.listAllUserUsage();

    info = {
      type: "admin",
      self: selfInfo,
      users: fullInfo
    };
  } else {
    throw new Error("Unknown role");
  }

  return info;
};

module.exports = { register, login, verify };