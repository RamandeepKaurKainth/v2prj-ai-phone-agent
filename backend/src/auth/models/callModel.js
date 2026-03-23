const db = require("../../db/db");

const saveMessage = async ({
  userId = null,
  callSid,
  phoneNumber = null,
  goal = null,
  role,
  message
}) => {
  if (!callSid || !role || !message) {
    throw new Error("Missing required fields");
  }

  const [result] = await db.execute(
    `
    INSERT INTO calls (user_id, call_sid, phone_number, goal, role, transcript)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [userId, callSid, phoneNumber, goal, role, message]
  );

  return result.insertId;
};

const getConversation = async (callSid) => {
  if (!callSid) {
    throw new Error("callSid is required");
  }

  const [rows] = await db.execute(
    `
    SELECT role, transcript
    FROM calls
    WHERE call_sid = ?
    ORDER BY id ASC
    `,
    [callSid]
  );

  return rows.map((row) => ({
    role: row.role,
    content: row.transcript
  }));
};

const getRecentCalls = async () => {
  const [rows] = await db.execute(
    `
    SELECT call_sid, phone_number, goal, transcript, role, created_at
    FROM calls
    ORDER BY created_at DESC
    LIMIT 20
    `
  );

  return rows;
};

module.exports = {
  saveMessage,
  getConversation,
  getRecentCalls
};