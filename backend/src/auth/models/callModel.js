const db = require("../../db/db");

const recordCall = async (userId, transcript, replyText) => {
  await db.execute(
    `
    INSERT INTO calls (user_id, transcript, reply_text)
    VALUES (?, ?, ?)
    `,
    [userId, transcript, replyText]
  );
};

module.exports = {
  recordCall
};