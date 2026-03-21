const { askLLM } = require("./llmService");

const memory = {}; // store conversation per session

async function agentRespond(sessionId, userText) {
  if (!memory[sessionId]) memory[sessionId] = [];

  memory[sessionId].push({ role: "user", content: userText });

  const reply = await askLLM(memory[sessionId]);

  memory[sessionId].push({ role: "assistant", content: reply });

  return reply;
}

module.exports = { agentRespond };
