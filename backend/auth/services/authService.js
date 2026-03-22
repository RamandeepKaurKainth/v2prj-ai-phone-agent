const userModel = require("../models/userModel");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken, verifyToken} = require("../utils/jwt");

const register = async (email, password) => {
  const existing = await userModel.findUserByEmail(email);
  if (existing) throw new Error("Email already exists");

  const hashed = await hashPassword(password);
  return await userModel.createUser(email, hashed);
};

const login = async (email, password) => {
  //console.log("in authService");
  const user = await userModel.findUserByEmail(email);
  //console.log(user);
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password);
  //console.log("result of compare:"+valid);
  if (!valid) throw new Error("Invalid credentials");

  return generateToken({
    userId: user.id,
    email: user.email
  });
};

const verify = async (req) => {
  const payload = verifyToken(req);

  if (!payload) {
    throw new Error("payload empty, token unavailable");
  }

  const userID = payload.userId; // ⚠️ make sure this matches your JWT
  //const email = payload.email;

  const sqlRole = await userModel.getUserRole(userID);
  //console.log(sqlRole.role_id);
  let role = sqlRole.role_id;

  let info = {};

  if (role == 2) {
    // normal user
    const selfInfo = await userModel.getRemainingTimesByID(userID);

    info = {
      type: "user",
      self: selfInfo
    };

  } else if (role == 1) {
    // admin user
    const selfInfo = await userModel.getRemainingTimesByID(userID);
    const fullInfo = await userModel.listAllUserUsage();

    info = {
      type: "admin",
      self: selfInfo,
      users: fullInfo
    };
  }

  //console.log(info);
  return info;
};

module.exports = { register, login, verify };