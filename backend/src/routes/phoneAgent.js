const express = require("express");
const multer = require("multer");
const router = express.Router();

console.log("phoneAgent routes loaded");

const upload = multer();

const { speechToText } = require("../ai/sttService");
const { agentRespond } = require("../ai/agentService");
const { textToSpeech } = require("../ai/ttsService");

router.get("/test", (req, res) => {
  res.send("phone agent route works");
});

router.post("/full", upload.single("audio"), async (req, res) => {
  try {
    console.log("POST /full hit");

    if (!req.file) {
      return res.status(400).json({
        step: "upload",
        error: "No audio file uploaded",
      });
    }

    const audioBuffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    const sessionId = req.body.sessionId || "session1";

    console.log("Uploaded:", req.file.originalname, mimetype);

    const text = await speechToText(audioBuffer, mimetype);
    if (!text) {
      return res.status(500).json({
        step: "stt",
        error: "Speech-to-text failed",
      });
    }

    const reply = await agentRespond(sessionId, text);
    if (!reply) {
      return res.status(500).json({
        step: "llm",
        error: "LLM failed",
      });
    }

    const audio = await textToSpeech(reply);
    if (!audio) {
      return res.status(500).json({
        step: "tts",
        error: "Text-to-speech failed",
      });
    }

    return res.json({
      success: true,
      text,
      reply,
      audio: audio.toString("base64"),
    });
  } catch (err) {
    console.error("Pipeline error:", err.message || err);
    return res.status(500).json({
      step: "pipeline",
      error: err.message || "Pipeline failed",
    });
  }
});

module.exports = router;