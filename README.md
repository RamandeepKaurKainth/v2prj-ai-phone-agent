🚀 AI Phone Agent — Backend
This repository contains the backend for an AI‑powered phone assistant.
It provides API endpoints for AI responses, mock speech processing, and session‑based conversational logic.

✨ Features
🤖 AI Response Generation
Integrates with OpenAI to generate natural language responses

Supports multi‑turn conversations using session‑based memory

Handles structured prompts and contextual replies

🧠 Session Memory
Each session stores previous messages

The assistant responds with context awareness

Memory resets per session

🎤 Speech‑to‑Text (Mock)
Converts incoming audio buffer into placeholder text

Used for testing the full pipeline without external STT services

🔊 Text‑to‑Speech (Mock)
Converts AI responses into a placeholder audio buffer

Used for testing before integrating real TTS providers

🔌 API Endpoints
POST /api/ai/test
Returns an AI‑generated reply based on a text prompt.

Example request:

json
{
  "prompt": "Hello"
}
Example response:

json
{
  "reply": "Hello! I'm here to help..."
}
POST /api/ai/full
Runs the full pipeline:

Code
Audio → STT → AI Response → TTS → Output
Example response:

json
{
  "text": "mock user speech text",
  "reply": "AI-generated response...",
  "audio": "mock-audio-buffer"
}
POST /api/phone-agent/start
Mock endpoint for initiating a phone‑assistant session.

📁 Project Structure
Code
backend/
  server.js
  .env
  package.json
  src/
    ai/
      llmService.js
      agentService.js
      sttService.js
      ttsService.js
    routes/
      ai.js
      auth.js
      phoneAgent.js
    db/
      db.js
🔐 Environment Variables
Create a .env file inside the backend folder:

Code
OPENAI_API_KEY=your_openai_key_here
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=v2prj
▶️ Running the Backend
bash
cd backend
npm install
npm run dev
Server runs on:

Code
http://localhost:5000
Expected console output:

Code
Server started on port 5000
MySQL connected
📌 Current Status
The backend currently supports:

AI text responses

Session‑based conversational memory

Mock STT and TTS

Full AI pipeline endpoint

Basic phone‑assistant start endpoint

Database connection

More features will be added in upcoming updates.