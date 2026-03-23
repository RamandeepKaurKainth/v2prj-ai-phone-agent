const { DeepgramClient } = require("@deepgram/sdk");

async function speechToText(audioBuffer, mimetype) {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error("Missing DEEPGRAM_API_KEY");
  }

  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error("No audio buffer received");
  }

  if (!Buffer.isBuffer(audioBuffer)) {
    throw new Error("audioBuffer is not a valid Buffer");
  }

  const normalizedMimeType =
    mimetype === "video/mpeg" ? "audio/mpeg" : mimetype;

  console.log("STT mimetype:", mimetype);
  console.log("STT normalized mimetype:", normalizedMimeType);
  console.log("STT buffer size:", audioBuffer.length);

  try {
    const deepgram = new DeepgramClient({
      apiKey: process.env.DEEPGRAM_API_KEY,
    });

    const response = await deepgram.listen.v1.media.transcribeFile(
      audioBuffer,
      {
        model: "nova-3",
        smart_format: true,
        mimetype: normalizedMimeType,
      }
    );

    console.log("Deepgram full response:", JSON.stringify(response, null, 2));

    const transcript =
      response?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

    if (!transcript || !transcript.trim()) {
      return null;
    }

    return transcript.trim();
  } catch (err) {
    console.error("STT Error message:", err.message);
    console.error("STT Error:", err);
    throw err;
  }
}

module.exports = { speechToText };