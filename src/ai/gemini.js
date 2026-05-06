import { loadMemory, saveMemory }
from "../core/memory.js";

export async function askGemini(prompt, userInput, imageData = null, mimeType = null) {
    const url = "/api/gemini";
    
    // 1. User ka message history mein daalein
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    // 2. Sirf TEXT rakhein instruction mein (Object nahi)
    const jarvisRules = `You are JARVIS, a professional AI created by AAMIR AHMAD WANI. 
    Address the user as '${currentUserName}'. Respond EXACTLY in the user's language. 
    Current date: ${new Date().toDateString()}. 
    Be witty, professional (British style), and empathetic. 
    If identity is unknown, ask for their name. Stay in character as a project partner.`;

    // 3. Message parts taiyar karein (Text + Image agar ho)
    let messageParts = [{ text: userInput || prompt }];
    if (imageData && mimeType) {
        messageParts.push({
            inline_data: {
                mime_type: mimeType,
                data: imageData
            }
        });
    }

    // 4. Sabse important: Request Body ka sahi structure
    const requestBody = {
        contents: chatHistory.length > 0 ? chatHistory : [{ parts: messageParts }],
        system_instruction: { 
            parts: [{ text: jarvisRules }] // Yahan sirf STRING jayegi
        }
    };

    // Agar image hai toh contents ko override karein taaki image saath jaye
    if (imageData) {
        requestBody.contents = [{ parts: messageParts }];
        output.innerHTML = `<span class="analysing-text">SCANNING DATA... ANALYSING IMAGE...</span>`;
         updateVisualCoreState('speaking');
         }  else {
            output.innerText = "Jarvis is 🧠 Thinking...";
        }

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await res.json();

        if (data.error) {
            console.error("Google API Error:", data.error);
            return "Sir, " + data.error.message;
        }

        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;

            // AI ka jawab history mein daalein
            chatHistory.push({ role: "model", parts: [{ text: aiReply }] });

            if (chatHistory.length > 15) chatHistory.shift();
            saveMemory();
            
            return aiReply;
        } else {
            return "Sir, I couldn't process that. Check the console.";
        }
    } catch (err) {
        console.error(err);
        return "Connection error, Sir.";
    }
}


