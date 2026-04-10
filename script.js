// ==============================
// JARVIS VOICE ASSISTANT CORE
// ==============================
let chatHistory = []; 
const output = document.getElementById("output");
const micBtn = document.getElementById("micBtn");

let isJarvisSpeaking = false; // Flag to track if AI is talking


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-IN";

recognition.continuous = true; // Keep false to process discrete chunks (more stable for wake words)
recognition.interimResults = false;

// --- START LISTENING ---
micBtn.addEventListener("click", () => {
    recognition.start();
    output.innerText = "Listening...";
});

// 2. Controlled Restart Function
function startListeningSafely() {
    // Only restart if not already speaking and mic is off
    if (!isJarvisSpeaking) {
        try {
            recognition.start();
            console.log("System listening for wake word...");
        } catch (e) {
            // Already started, ignore error
        }
    }
}

/*recognition.onresult = async (event) => {
    const command = event.results[0][0].transcript;
    output.innerText = "You: " + command;
    
    // Yahan handleCommand function ko call karein
    await handleCommand(command.toLowerCase());
};*/

//NEW CODE

/*recognition.onresult = async (event) => {
    const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
    
    output.innerText = "You: " + command;
    
    console.log("Heard:", command);

    await handleCommand(command.toLowerCase());
      
    // Wake word check
    if (command.startsWith("jarvis")) {

        let cleanCommand = command.replace("jarvis", "").trim();

        if (!cleanCommand) return;

        output.innerText = "You: " + cleanCommand;

        await handleCommand(cleanCommand);
    } 
    else {
        console.log("Ignored (no wake word)");
    }
};*/

// 3. Result Handler
recognition.onresult = async (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    console.log("Heard:", transcript);

    if (transcript.includes("jarvis")) {
        let cleanCommand = transcript.split("jarvis").pop().trim();
        if (cleanCommand) {
            await handleCommand(cleanCommand);
        } else {
            speak("Yes Sir, I am listening.");
        }
    }
};

// 4. Loop Prevention on End
recognition.onend = () => {
    // Rapid looping prevent karne ke liye 300ms ka gap
    setTimeout(() => {
        startListeningSafely();
    }, 300);
};

/* --- SPEAK FUNCTION (AI Jawab Dene Ke Baad Mic On Karega) ---
function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";

    // Jab AI bolna shuru kare, mic band kar do taki wo khud ko na sune
    recognition.stop();

    speech.onend = () => {
        // Jab AI bolna khatam kar le, tab mic dobara auto-start ho jaye
        console.log("AI finished. Restarting mic for next command...");
        recognition.start();
        output.innerText = "Listening again...";
    };

    window.speechSynthesis.speak(speech);
}*/

// ==============================
// GEMINI API (AI BRAIN)
// ==============================
async function askGemini(prompt) {
    const url = "/api/gemini";
    
    // 1. User message added to history
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const requestBody = {
        contents: chatHistory,
        system_instruction: {
            parts: [{ text: "You are Jarvis, a witty and helpful AI assistant. Remember user's personal details and keep answers user friendly ." }]
        }
    };

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

            // 2. AI reply added to history
            chatHistory.push({ role: "model", parts: [{ text: aiReply }] });

            // Memory limit: Keeps only the last 20 messages
            if (chatHistory.length > 20) chatHistory.shift();

            return aiReply;
        } else {
            return "Sir, I couldn't process that. Check the console.";
        }
    } catch (err) {
        console.error(err);
        return "Connection error, Sir.";
    }
}

// ==============================
// COMMAND HANDLER
// ==============================
/*async function handleCommand(cmd) {
    const apps = {
        "whatsapp": "https://whatsapp.com",
        "youtube": "https://youtube.com",
        "instagram": "https://instagram.com",
        "facebook": "https://facebook.com",
        "google": "https://google.com"
    };

    // 1. INSTANT CHECK: Agar 'open' word hai, toh bina kisi wait ke turant open karo
    if (cmd.startsWith("JARVIS open ")) {
        let appName = cmd.replace("open ", "").trim();
        
        if (apps[appName]) {
            window.open(apps[appName], "_blank"); // Pehle window kholo (Instant)
            speak(`Opening ${appName}`);           // Saath mein bolo
            return; 
        }
    } 

    // 2. Search Logic (Instant)
    if (cmd.includes("search for")) {
        let searchTerm = cmd.replace("search for", "").trim();
        window.open(`https://google.com/search?q=${searchTerm}`, "_blank");
        speak("Searching Google for " + searchTerm);
        return;
    }

    // 3. AI Brain (Sirf tab chalega jab upar ka kuch match nahi hoga)
    output.innerText = "Jarvis is thinking...";
    const reply = await askGemini(cmd);
    speak(reply);
}*/

async function handleCommand(cmd) {
    // 1. Social Media & Apps (Action First)
    if (cmd.includes("open youtube")) {
        speak("Opening YouTube, Sir.");
        window.open("https://www.youtube.com", "_blank");
    } 
    else if (cmd.includes("open facebook")) {
        speak("Opening Facebook for you, Sir.");
        window.open("https://www.facebook.com", "_blank");
    } 
    else if (cmd.includes("open instagram")) {
        speak("Right away Sir, opening Instagram.");
        window.open("https://www.instagram.com", "_blank");
    }
    else if (cmd.includes("open google")) {
        speak("Opening Google search, Sir.");
        window.open("https://www.google.com", "_blank");
    }

 /*   else if (cmd.includes("search for")) {
        let searchTerm = cmd.replace("search for", "").trim();
        window.open(`https://google.com/search?q=${searchTerm}`, "_blank");
        speak("Searching Google for " + searchTerm);
        return;
    }  */

    // 2. Agar upar wala koi command nahi match hota, tab Gemini se pucho
    else {
        output.innerText = "Jarvis is thinking...";
        const reply = await askGemini(cmd);
        speak(reply);
    }
}


//test code 01

// Function to update the visual state of the neural core
function updateVisualCoreState(state, text = "") {

    const micContainer = document.querySelector('.mic-btn-container');
    micContainer.classList.remove('reactive-listen', 'reactive-speak');

    if (state === 'listening') {
        micContainer.classList.add('reactive-listen');
        output.innerText = text || "System Status: Core Active...";
    }
    else if (state === 'speaking') {
        micContainer.classList.add('reactive-speak');
        // Yahan hum text overwrite nahi karenge agar text pass kiya gaya hai
        output.innerText = text || "Jarvis Status: Transmission Processing...";
    } 
    else {
        output.innerText = "System Status: Core Idle.";
    }
}

// 2. JS: Mic and Speak Event Updates

recognition.onstart = () => {
    console.log("🎤 Mic Activated - Core sync starting...");
    updateVisualCoreState('listening'); // Change to listening waves
};

recognition.onend = () => {
    //console.log("🛑 Stopped listening - Sync standby.");
    // Agar Jarvis bol nahi raha, toh mic restart karo
    if (!window.speechSynthesis.speaking) {
        console.log("Mic timed out. Restarting...");
        try {
            recognition.start();
        } catch (e) {
            console.error("Restart failed:", e);
        }
    }
};
};

recognition.onerror = (event) => {
    console.error("Speech error:", event.error);
    if (event.error === 'no-speech') {
        // No speech detected, just restart quietly
        recognition.stop(); 
    }
};

// ==============================
// CUSTOM SMART SPEAK
// ==============================
function speak(text) {

       window.speechSynthesis.cancel()

      isJarvisSpeaking = true; // Mark as speaking
    recognition.stop();      // Stop mic immediately
    
    //output.innerText = "JARVIS: " + text; 
    
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN"; // Set to Indian accent for Hinglish

     //recognition.stop();

    speech.onstart = () => updateVisualCoreState('speaking', "JARVIS: " + text);
    
    // Peak reaction when speaking
    updateVisualCoreState('speaking', "JARVIS: " + text);
 // Change to speaking waves

    // Bolne ke baad mic standby mode pe jayega
    speech.onend = () => {
        isJarvisSpeaking = false; 
        //console.log("Jarvis finished speaking.");

        //recognition.start();
        
        updateVisualCoreState('idle'); 
        console.log("Speaking finished. Re-syncing mic...");
        setTimeout(() => {
            try { recognition.start(); } catch(e) {} 
        }, 1000);  
    };

    window.speechSynthesis.speak(speech);
}
