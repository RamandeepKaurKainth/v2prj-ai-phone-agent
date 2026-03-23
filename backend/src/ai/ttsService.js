const { ElevenLabsClient } = require("elevenlabs");

async function textToSpeech(text) {
  if (!text || !text.trim()) {
    throw new Error("Empty text");
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("Missing ELEVENLABS_API_KEY");
  }

  if (!process.env.ELEVENLABS_VOICE_ID) {
    throw new Error("Missing ELEVENLABS_VOICE_ID");
  }

  console.log("TTS input text:", text);

  try {
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const audioStream = await client.textToSpeech.convert(
      process.env.ELEVENLABS_VOICE_ID,
      {
        text,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_22050_32",
      }
    );

    const chunks = [];

    for await (const chunk of audioStream) {
      if (chunk) {
        chunks.push(Buffer.from(chunk));
      }
    }

    const audioBuffer = Buffer.concat(chunks);

    if (!audioBuffer.length) {
      throw new Error("Empty audio buffer from ElevenLabs");
    }

    console.log("TTS buffer size:", audioBuffer.length);

    return audioBuffer;
  } catch (err) {
    console.error("TTS Error full:", err);
    console.error("TTS Error message:", err.message);
    throw err;
  }
}

module.exports = { textToSpeech };