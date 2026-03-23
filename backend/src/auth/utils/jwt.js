const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });
};

const verifyToken = (req) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET");
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const parts = authHeader.split(" ");
  const token = parts[1];

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};