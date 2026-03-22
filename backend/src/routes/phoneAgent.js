const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer();

const authService = require("../auth/services/authService");
const userModel = require("../auth/models/userModel");
const callModel = require("../auth/models/callModel");

const { speechToText } = require("../ai/sttService");
const { agentRespond } = require("../ai/agentService");
const { textToSpeech } = require("../ai/ttsService");

router.get("/test", (req, res) => {
  res.send("phone agent route works");
});

router.post("/full", upload.single("audio"), async (req, res) => {
  try {
    const userInfo = await authService.verify(req);
    const userId = userInfo.userId;

    if (!userInfo.self) {
      return res.status(401).json({
        step: "auth",
        error: "User info not found"
      });
    }

    if (Number(userInfo.self.remaining_calls) <= 0) {
      return res.status(403).json({
        step: "limit",
        error: "No remaining calls available"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        step: "upload",
        error: "No audio file uploaded"
      });
    }

    const audioBuffer = req.file.buffer;
    let mimetype = req.file.mimetype;
    const sessionId = req.body.sessionId || `user-${userId}`;

    if (mimetype === "video/mpeg") {
      mimetype = "audio/ogg";
    }

    const text = await speechToText(audioBuffer, mimetype);
    if (!text) {
      return res.status(500).json({
        step: "stt",
        error: "Speech-to-text failed"
      });
    }

    const reply = await agentRespond(sessionId, text);
    if (!reply) {
      return res.status(500).json({
        step: "llm",
        error: "LLM failed"
      });
    }

    const audio = await textToSpeech(reply);
    if (!audio) {
      return res.status(500).json({
        step: "tts",
        error: "Text-to-speech failed"
      });
    }

    await callModel.recordCall(userId, text, reply);

    const refreshedInfo = await userModel.getRemainingTimesByID(userId);

    return res.json({
      success: true,
      text,
      reply,
      audio: audio.toString("base64"),
      usage: refreshedInfo
    });
  } catch (err) {
    console.error("Pipeline error:", err.message || err);
    return res.status(500).json({
      step: "pipeline",
      error: err.message || "Pipeline failed"
    });
  }
});

module.exports = router;