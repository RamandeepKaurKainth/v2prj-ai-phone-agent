# AI Phone Agent / Virtual Front Desk

# Team Information
Team #: v2prj

Members:
- Ramandeep Kaur – responsible for AI component and call orchestration endpoints  
- Jiahong Xu – frontend and UI  

# Project Description
This project is an AI Phone Agent system that can simulate a phone call conversation based on a given goal.  
The user provides a phone number and a prompt (for example, reminding someone to take medicine), and the system generates responses using an AI model.

The system processes user input, maintains conversation context, and returns responses in both text and audio format. It is designed to later integrate with a telephony API for real phone calls.

# AI Functionality
The project includes an AI component that handles conversation logic.  
It uses an AI model to generate responses based on user input and the original prompt.

The flow is:
- user input (text or audio)  
- speech-to-text (mock)  
- AI response generation  
- text-to-speech (mock)  

This demonstrates the integration of AI into the system as required.

# Microservice Architecture (Basic)
The system follows a simple microservice-style design:

- Client Application (Frontend)  
- API Gateway / Backend Server  
- Call Orchestrator Service  
- AI Component (Agent Service, LLM, STT, TTS)  
- Database  

The Call Orchestrator manages sessions and communication between services.  
The AI component processes input and generates responses.

# Endpoints Implemented

# POST /api/orchestrator/start
Starts a new call session.

# POST /api/agent/respond
Processes user input and returns AI response.

# POST /api/ai/test
Basic AI response test endpoint.

# POST /api/ai/full
Runs full AI pipeline (STT → AI → TTS).

# Database Design
The system uses a MySQL database with basic tables:

- users (stores login and roles)  
- call_sessions (stores session details and prompts)  

# Milestone 1 Status
The following features are implemented:

- user registration and login (basic structure ready / in progress)  
- API endpoints for AI interaction  
- session-based conversation handling  
- AI component integrated (mock STT and TTS)  
- basic backend structure and database setup  

# Notes
- Speech-to-text and text-to-speech are currently mock implementations  
- Real telephony integration will be added in future  
- System is designed to be modular and extendable  

# Conclusion
This project demonstrates an AI-powered API system with session handling, basic authentication structure, and microservice-style design. It meets the Milestone 1 requirements by integrating AI functionality and providing working backend endpoints.