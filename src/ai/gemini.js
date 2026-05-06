import { loadMemory, saveMemory }
from "../core/memory.js";

export async function askGemini(prompt) {

    const url = "/api/gemini";

    let chatHistory = loadMemory();

    chatHistory.push({
        role: "user",
        parts: [{ text: prompt }]
    });

    const requestBody = {

        contents: chatHistory
    };

    try {

        const res = await fetch(url, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(requestBody)
        });

        const data = await res.json();

        const reply =
            data.candidates?.[0]?.content?.parts?.[0]?.text
            ||
            "No response.";

        chatHistory.push({
            role: "model",
            parts: [{ text: reply }]
        });

        saveMemory(chatHistory);

        return reply;

    } catch (err) {

        console.error(err);

        return "Connection error.";
    }
}
