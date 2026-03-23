const db = require("../../db/db");

const saveMessage = async ({
  userId = null,
  callSid = null,
  phoneNumber = null,
  goal = null,
  role,
  message
}) => {
  await db.execute(
    `
    INSERT INTO calls (user_id, call_sid, phone_number, goal, role, transcript)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [userId, callSid, phoneNumber, goal, role, message]
  );
};

const getConversation = async (callSid) => {
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