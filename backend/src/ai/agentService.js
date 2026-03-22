const { askLLM } = require("./llmService");

const memory = {}; // store conversation per session

async function agentRespond(sessionId, userText) {
  try {
    if (!sessionId || !userText) {
      throw new Error("Missing sessionId or userText");
    }

    // initialize session memory
    if (!memory[sessionId]) {
      memory[sessionId] = [];
    }

    // add user message
    memory[sessionId].push({
      role: "user",
      content: userText,
    });

    // get LLM reply
    const reply = await askLLM(memory[sessionId]);

    // add assistant response
    memory[sessionId].push({
      role: "assistant",
      content: reply,
    });

    return reply;

  } catch (err) {
    console.error("Agent error:", err.message || err);
    return "Sorry, something went wrong.";
  }
}

module.exports = { agentRespond };