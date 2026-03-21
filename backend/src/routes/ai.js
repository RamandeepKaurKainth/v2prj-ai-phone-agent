const express = require("express");
const { agentRespond } = require("../ai/agentService");
const { speechToText } = require("../ai/sttService");
const { textToSpeech } = require("../ai/ttsService");

const router = express.Router();

router.post("/test", async (req, res) => {
  const { prompt } = req.body;
  const reply = await agentRespond("test-session", prompt);
  res.json({ reply });
});

router.post("/full", async (req, res) => {
  const { audioBuffer, sessionId } = req.body;

  const text = await speechToText(audioBuffer);
  const reply = await agentRespond(sessionId, text);
  const audio = await textToSpeech(reply);

  res.json({ text, reply, audio });
});

module.exports = router;
