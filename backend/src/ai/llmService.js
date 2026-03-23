const axios = require("axios");

async function askLLM(messages) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages array is empty");
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;

    if (!content || !content.trim()) {
      throw new Error("Empty response content from OpenAI");
    }

    return content.trim();
  } catch (err) {
    console.error("LLM Error Status:", err.response?.status);
    console.error("LLM Error Data:", err.response?.data);
    console.error("LLM Error Message:", err.message);
    throw err;
  }
}

module.exports = { askLLM };