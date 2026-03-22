const axios = require("axios");

async function askLLM(messages) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    if (!messages || messages.length === 0) {
      throw new Error("Messages array is empty");
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    return response.data.choices[0].message.content;

  } catch (err) {
    console.error("LLM Error:", err.response?.data || err.message);
    return "Sorry, I couldn't generate a response.";
  }
}

module.exports = { askLLM };