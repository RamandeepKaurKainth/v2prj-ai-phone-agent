const express = require("express");
const multer = require("multer");
const twilio = require("twilio");

const router = express.Router();
const upload = multer();

const authService = require("../auth/services/authService");
const userModel = require("../auth/models/userModel");
const callModel = require("../auth/models/callModel");

const { speechToText } = require("../ai/sttService");
const { agentRespond } = require("../ai/agentService");
const { textToSpeech } = require("../ai/ttsService");

const VoiceResponse = twilio.twiml.VoiceResponse;
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

router.get("/test", (req, res) => {
  res.send("phone agent route works");
});

router.get("/recent-calls", async (req, res) => {
  try {
    const calls = await callModel.getRecentCalls();
    return res.json(calls);
  } catch (err) {
    console.error("Recent calls error:", err);
    return res.status(500).json({
      error: "Failed to load recent calls"
    });
  }
});

router.post("/full", upload.single("audio"), async (req, res) => {
  try {
    const userInfo = await authService.verify(req);

    if (!userInfo) {
      return res.status(401).json({
        step: "auth",
        error: "Unauthorized"
      });
    }

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
    const mimetype = req.file.mimetype;
    const sessionId = req.body.sessionId || `user-${userId}`;
    const callSid = req.body.callSid || `web-${Date.now()}`;

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

    await callModel.saveMessage({
      userId,
      callSid,
      role: "user",
      message: text
    });

    await callModel.saveMessage({
      userId,
      callSid,
      role: "assistant",
      message: reply
    });

    const refreshedInfo = await userModel.getRemainingCallsById(userId);

    return res.json({
      success: true,
      text,
      reply,
      audio: audio.toString("base64"),
      usage: refreshedInfo
    });
  } catch (err) {
    console.error("Pipeline error:", err);
    return res.status(500).json({
      step: "pipeline",
      error: err.message || "Pipeline failed"
    });
  }
});

router.post("/call", async (req, res) => {
  try {
    const { phoneNumber, goal } = req.body;

    if (!phoneNumber || !goal) {
      return res.status(400).json({
        error: "phoneNumber and goal are required"
      });
    }

    if (!process.env.BACKEND_URL) {
      return res.status(500).json({
        error: "Missing BACKEND_URL"
      });
    }

    const encodedGoal = encodeURIComponent(goal);

    const call = await twilioClient.calls.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.BACKEND_URL}/api/phone-agent/voice?goal=${encodedGoal}`,
      method: "POST"
    });

    return res.json({
      success: true,
      message: "Call initiated successfully",
      callSid: call.sid,
      phoneNumber,
      goal
    });
  } catch (err) {
    console.error("Twilio call error:", err);
    return res.status(500).json({
      error: err.message || "Failed to initiate call"
    });
  }
});

router.post("/voice", async (req, res) => {
  try {
    const twiml = new VoiceResponse();
    const goal = req.query.goal || "I am calling to have a helpful conversation.";

    twiml.say(
      { voice: "alice" },
      `Hello, this is an AI assistant calling. ${goal} Please let me know your response after the beep.`
    );

    const gather = twiml.gather({
      input: "speech",
      action: `/api/phone-agent/process-speech?goal=${encodeURIComponent(goal)}`,
      method: "POST",
      speechTimeout: "auto",
      timeout: 5
    });

    gather.say({ voice: "alice" }, "I'm listening.");

    twiml.redirect(
      { method: "POST" },
      `/api/phone-agent/voice?goal=${encodeURIComponent(goal)}`
    );

    res.type("text/xml");
    return res.send(twiml.toString());
  } catch (err) {
    console.error("Twilio voice error:", err);

    const twiml = new VoiceResponse();
    twiml.say({ voice: "alice" }, "Sorry, something went wrong. Goodbye.");
    twiml.hangup();

    res.type("text/xml");
    return res.send(twiml.toString());
  }
});

router.post("/process-speech", async (req, res) => {
  try {
    const speechText = (req.body.SpeechResult || "").trim();
    const callSid = req.body.CallSid || `twilio-${Date.now()}`;
    const phoneNumber = req.body.From || null;
    const goal = req.query.goal || "Have a helpful conversation.";

    console.log("Twilio speech received:", speechText);
    console.log("CallSid:", callSid);
    console.log("Phone number:", phoneNumber);
    console.log("Goal:", goal);

    const twiml = new VoiceResponse();

    if (!speechText) {
      twiml.say(
        { voice: "alice" },
        "Sorry, I did not catch that. Please say it again."
      );

      const gather = twiml.gather({
        input: "speech",
        action: `/api/phone-agent/process-speech?goal=${encodeURIComponent(goal)}`,
        method: "POST",
        speechTimeout: "auto",
        timeout: 5
      });

      gather.say({ voice: "alice" }, "Please speak now.");

      res.type("text/xml");
      return res.send(twiml.toString());
    }

    await callModel.saveMessage({
      callSid,
      phoneNumber,
      goal,
      role: "user",
      message: speechText
    });

    const lowerText = speechText.toLowerCase();
    const shouldEnd =
      lowerText.includes("bye") ||
      lowerText.includes("goodbye") ||
      lowerText.includes("thank you") ||
      lowerText.includes("thanks that's all") ||
      lowerText.includes("that is all") ||
      lowerText.includes("no that's all") ||
      lowerText.includes("nothing else");

    if (shouldEnd) {
      const goodbyeReply = "Thank you. Have a great day. Goodbye.";

      await callModel.saveMessage({
        callSid,
        phoneNumber,
        goal,
        role: "assistant",
        message: goodbyeReply
      });

      twiml.say({ voice: "alice" }, goodbyeReply);
      twiml.hangup();

      res.type("text/xml");
      return res.send(twiml.toString());
    }

    let reply = await agentRespond(callSid, speechText);

    if (!reply || !reply.trim()) {
      reply = "I understand. Could you please tell me a little more?";
    }

    await callModel.saveMessage({
      callSid,
      phoneNumber,
      goal,
      role: "assistant",
      message: reply
    });

    const replyLower = reply.toLowerCase();
    const aiEndsCall =
      replyLower.includes("goodbye") ||
      replyLower.includes("have a great day") ||
      replyLower.includes("have a nice day") ||
      replyLower.includes("thank you for your time");

    twiml.say({ voice: "alice" }, reply);

    if (aiEndsCall) {
      twiml.hangup();
      res.type("text/xml");
      return res.send(twiml.toString());
    }

    const gather = twiml.gather({
      input: "speech",
      action: `/api/phone-agent/process-speech?goal=${encodeURIComponent(goal)}`,
      method: "POST",
      speechTimeout: "auto",
      timeout: 5
    });

    gather.say({ voice: "alice" }, "Please go ahead.");

    res.type("text/xml");
    return res.send(twiml.toString());
  } catch (err) {
    console.error("Twilio process speech error:", err);

    const twiml = new VoiceResponse();
    twiml.say({ voice: "alice" }, "Sorry, something went wrong. Goodbye.");
    twiml.hangup();

    res.type("text/xml");
    return res.send(twiml.toString());
  }
});

module.exports = router;