# VoiceReach

VoiceReach is a lightweight Node.js proxy that connects Vapi's OpenAI-compatible chat-completions interface to a separate VoiceReach AI backend. It forwards the latest user message and call session identifier, then converts the backend response into the response shape expected by the voice integration.

## Features

- Express-based HTTP proxy
- CORS and JSON request handling
- OpenAI-compatible chat-completions routes:
  - `POST /v1/chat/completions`
  - `POST /chat/completions`
- Extracts the latest user message from the conversation history
- Passes the Vapi call ID as the backend session ID
- Supports both JSON and Server-Sent Events-style streaming responses
- Returns a fallback assistant response when the backend request fails
- Includes a small mock AI service for local response testing

## Tech Stack

- Node.js
- Express 5
- Axios
- CORS

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
git clone https://github.com/ayomidebello604-a11y/VoiceReach.git
cd VoiceReach
npm install
```

### Start the Proxy

```bash
node index.js
```

The proxy listens on port `3000`.

The current backend URL is configured through the `AI_BACKEND_URL` constant in `index.js`. Update that value in the source if you need to point the proxy to a different AI backend.

### Run the Mock Backend

In a separate terminal:

```bash
node mock-ai.js
```

The mock service listens on port `8000` and returns a sample response. The proxy currently targets the configured remote backend URL; point `AI_BACKEND_URL` to the mock service's `/chat` endpoint when you want to test the proxy against the local mock.

### Test the Proxy

With the proxy and a reachable backend running, execute:

```bash
node test.js
```

The test sends a sample chat-completions request to the local proxy and prints the response.

## API

### Request

Send a POST request to `/v1/chat/completions` (or `/chat/completions`) with a Vapi/OpenAI-compatible payload containing a `messages` array. The proxy selects the most recent message whose role is `user` and forwards its content with the call ID.

### Response

The proxy wraps the backend's `message` value in an OpenAI-compatible `choices` response. When streaming is requested, it emits a sequence of Server-Sent Events chunks followed by `[DONE]`.

## Project Files

- `index.js` — main Express proxy
- `mock-ai.js` — standalone mock backend for local testing
- `test.js` — sample request script
- `package.json` — project dependencies and metadata

## Notes

This repository contains the proxy/integration layer. The AI backend itself is hosted separately and is not included in this repository.
