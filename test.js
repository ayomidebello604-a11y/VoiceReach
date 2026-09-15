const axios = require('axios');

async function test() {
    try {
        console.log("Sending request to Proxy (Port 3000)...");
        const response = await axios.post('http://localhost:3000/v1/chat/completions', {
            model: "voicereach-custom",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "I have a fever, what should I do?" }
            ],
            call: { id: "test-call-id-999" }
        });

        console.log("\n Success! Received response from Proxy:");
        console.log(JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error(" Test failed:", e.message);
    }
}

test();
