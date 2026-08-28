const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// The port for our proxy server
const PORT = 3000;

// The URL of your AI developer's backend
// The URL of your AI developer's backend (Hugging Face Space)
const AI_BACKEND_URL = 'https://darish555-voicereach-ai.hf.space/chat';

// Vapi expects an OpenAI compatible endpoint
// Based on the Vapi dashboard, it appends /chat/completions to the base URL
app.post(['/v1/chat/completions', '/chat/completions'], async (req, res) => {
    try {
        const { messages, call } = req.body;

        // 1. Extract the latest user message from the Vapi messages array
        // Vapi sends the whole conversation history, but your AI dev's API only needs the latest message
        const lastUserMessage = messages
            .slice()
            .reverse()
            .find(m => m.role === 'user');

        const messageText = lastUserMessage ? lastUserMessage.content : "";

        // 2. Get the session ID. Vapi passes call metadata in custom LLM integrations.
        // We fallback to a default if it's missing.
        const sessionId = call?.id || "demo-session-id";

        console.log(`[Proxy] Received message from Vapi. Session: ${sessionId}, Message: "${messageText}"`);

        // 3. Forward to the AI developer's custom API
        const aiResponse = await axios.post(AI_BACKEND_URL, {
            session_id: sessionId,
            message: messageText
        });

        const aiData = aiResponse.data;
        console.log(`[Proxy] Received response from AI Backend: "${aiData.message}"`);

        // 4. Wrap the response in the OpenAI format that Vapi expects
        if (req.body.stream) {
            // Vapi requested a stream (Server-Sent Events)
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const baseChunk = {
                id: 'chatcmpl-' + Date.now(),
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: 'voicereach-custom'
            };

            // Send role
            res.write(`data: ${JSON.stringify({ ...baseChunk, choices: [{ index: 0, delta: { role: 'assistant' }, finish_reason: null }] })}\n\n`);
            
            // Send content
            res.write(`data: ${JSON.stringify({ ...baseChunk, choices: [{ index: 0, delta: { content: aiData.message }, finish_reason: null }] })}\n\n`);
            
            // Send finish
            res.write(`data: ${JSON.stringify({ ...baseChunk, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] })}\n\n`);
            
            res.write(`data: [DONE]\n\n`);
            res.end();
        } else {
            // Non-streaming JSON response
            const openAiResponse = {
                id: 'chatcmpl-' + Date.now(),
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model: 'voicereach-custom',
                choices: [{
                    index: 0,
                    message: { role: 'assistant', content: aiData.message },
                    finish_reason: 'stop'
                }],
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
            };
            res.json(openAiResponse);
        }

    } catch (error) {
        console.error("[Proxy] Error calling AI Backend:", error.message);
        
        // Fallback response so the phone call doesn't just hang or crash if the backend fails
        res.json({
            choices: [{
                message: {
                    role: 'assistant',
                    content: "I'm sorry, I am having trouble connecting to the network. Please try again."
                }
            }]
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 VoiceReach Proxy Server running at http://localhost:${PORT}`);
    console.log(`Waiting for Vapi connections on POST /v1/chat/completions`);
});
