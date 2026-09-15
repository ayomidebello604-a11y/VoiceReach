const express = require('express');

const app = express();
app.use(express.json());

const PORT = 8000;

app.post('/chat', (req, res) => {
    const { session_id, message } = req.body;
    
    console.log(`[AI Backend] Received session_id: ${session_id}, message: "${message}"`);
    
    // Simulate AI thinking delay
    setTimeout(() => {
        res.json({
            message: "I understand you have a question. Please go to the nearest clinic for assistance.",
            intent: "general_inquiry",
            stage: "providing_answer",
            risk_level: "low",
            continue_conversation: true,
            confidence: 0.95,
            sources: []
        });
    }, 500); // 500ms delay to simulate model latency
});

app.listen(PORT, () => {
    console.log(` Mock AI Developer Server running at http://localhost:${PORT}`);
});
