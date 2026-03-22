const { DeepgramClient } = require("@deepgram/sdk");

async function speechToText(audioBuffer, mimetype) {
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error("Missing DEEPGRAM_API_KEY");
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error("No audio buffer received");
    }

    console.log("STT mimetype:", mimetype);
    console.log("STT buffer size:", audioBuffer.length);

    if (mimetype === "video/mpeg") {
      mimetype = "audio/ogg";
    }

    const deepgram = new DeepgramClient({
      apiKey: process.env.DEEPGRAM_API_KEY,
    });

    const response = await deepgram.listen.v1.media.transcribeFile(
      audioBuffer,
      {
        model: "nova-3",
        smart_format: true,
        mimetype: mimetype,
      }
    );

    console.log("Deepgram full response:", JSON.stringify(response, null, 2));

    const transcript =
      response?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

    return transcript || null;
  } catch (err) {
    console.error("STT Error:", err.message || err);
    return null;
  }
}

module.exports = { speechToText };