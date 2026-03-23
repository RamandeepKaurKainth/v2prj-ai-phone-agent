const db = require("../../db/db");

const saveMessage = async ({
  userId = null,
  callSid,
  phoneNumber = null,
  goal = null,
  role,
  message
}) => {
  if (!callSid || !message) {
    throw new Error("Missing required fields");
  }

  const [result] = await db.execute(
    `
    INSERT INTO calls (user_id, call_sid, phone_number, goal, transcript)
    VALUES (?, ?, ?, ?, ?)
    `,
    [userId, callSid, phoneNumber, goal, message]
  );

  return result.insertId;
};

const getConversation = async (callSid) => {
  if (!callSid) {
    throw new Error("callSid is required");
  }

  const [rows] = await db.execute(
    `
    SELECT transcript
    FROM calls
    WHERE call_sid = ?
    ORDER BY id ASC
    `,
    [callSid]
  );

  return rows.map((row) => ({
    role: "user",
    content: row.transcript
  }));
};

const getRecentCalls = async () => {
  const [rows] = await db.execute(
    `
    SELECT id, call_sid, phone_number, goal, transcript, created_at
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