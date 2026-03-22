const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });
};

// Helper to verify JWT from Authorization header
const verifyToken=(req)=> {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(payload);
    return payload; // contains userId, email, role
  } catch (err) {
    return null;
  }
}


module.exports = { generateToken, verifyToken };