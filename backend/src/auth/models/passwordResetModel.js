const db = require("../../db/db");

const createResetToken = async (userId, token, expiresAt) => {
  await db.execute(
    `
    INSERT INTO password_resets (user_id, token, expires_at)
    VALUES (?, ?, ?)
    `,
    [userId, token, expiresAt]
  );
};

const findValidToken = async (token) => {
  const [rows] = await db.execute(
    `
    SELECT * FROM password_resets
    WHERE token = ? AND expires_at > NOW()
    ORDER BY id DESC
    LIMIT 1
    `,
    [token]
  );

  return rows[0];
};

const deleteToken = async (token) => {
  await db.execute(
    "DELETE FROM password_resets WHERE token = ?",
    [token]
  );
};

module.exports = {
  createResetToken,
  findValidToken,
  deleteToken
};