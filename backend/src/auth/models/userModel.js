const db = require("../../db/db");

const createUser = async (email, password) => {
  const [result] = await db.execute(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password]
  );

  return {
    id: result.insertId,
    email
  };
};

const findUserByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  return rows[0] || null;
};

const getRemainingCallsById = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT
      u.id,
      u.email,
      r.api_limit,
      COUNT(DISTINCT c.call_sid) AS used_calls,
      (r.api_limit - COUNT(DISTINCT c.call_sid)) AS remaining_calls
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN calls c ON c.user_id = u.id
    WHERE u.id = ?
    GROUP BY u.id, u.email, r.api_limit
    `,
    [userId]
  );

  return rows[0] || null;
};

const listAllUserUsage = async () => {
  const [rows] = await db.execute(
    `
    SELECT
      u.id,
      u.email,
      r.role_name,
      r.api_limit,
      COUNT(DISTINCT c.call_sid) AS used_calls,
      (r.api_limit - COUNT(DISTINCT c.call_sid)) AS remaining_calls
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN calls c ON c.user_id = u.id
    GROUP BY u.id, u.email, r.role_name, r.api_limit
    `
  );

  return rows;
};

const getUserRole = async (userId) => {
  const [rows] = await db.execute(
    "SELECT role_id FROM users WHERE id = ?",
    [userId]
  );

  return rows[0]?.role_id || null;
};

const findUserById = async (userId) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE id = ?",
    [userId]
  );

  return rows[0] || null;
};

const updatePasswordById = async (userId, hashedPassword) => {
  await db.execute(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashedPassword, userId]
  );
};

module.exports = {
  createUser,
  findUserByEmail,
  getRemainingCallsById,
  listAllUserUsage,
  getUserRole,
  findUserById,
  updatePasswordById
};