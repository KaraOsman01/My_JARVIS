// ==============================
// JARVIS VOICE ASSISTANT CORE
// ==============================
let chatHistory = []; 
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "en-IN";
recognition.continuous = false;
recognition.interimResults = false;

// MIC CLICK
micBtn.addEventListener("click", () => {
    try {
        recognition.start();
        output.innerText = "Listening...";
    } catch(e) {
        console.log("Mic already active");
    }
});

// RESULT
recognition.onresult = async (event) => {
    const command = event.results[1][0].transcript.toLowerCase();

    output.innerText = "You: " + command;

    await handleCommand(command.toLowerCase());
};

// AUTO RESTART
recognition.onend = () => {
    console.log("Restarting mic...");
    try {
        recognition.start();
    } catch(e) {}
};
 


// 3. Result Handler
recognition.onresult = async (event) => {

      // Check if result is defined
    if (!event.results) return;
    
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

async function handleCommand(cmd) {
    //const command = cmd.toLowerCase();

     // Ek generic function banayein jo link kholne se pehle Jarvis ko bolne de
      const openWithDelay = (url, msg) => {
       speak(msg); // Pehle Jarvis bolega
        setTimeout(() => {
          window.open(url, "_blank");
           }, 1500); // 1.5 second ka gap taaki awaaz poori ho jaye
        };
    
    // 1. Social Media & Apps (Action First)
    if (cmd.includes("open youtube")) {
        speak("Opening YouTube, Sir.");
        window.open("https://www.youtube.com", "_blank");
        //openWithDelay("https://www.youtube.com", "Opening YouTube, Sir.");
    } 
    else if (cmd.includes("open facebook")) {
        speak("Opening Facebook for you, Sir.");
        window.open("https://www.facebook.com", "_blank");
        //openWithDelay("https://www.facebook.com", "Opening Facebook for you, Sir.");
    } 
    else if (cmd.includes("open instagram")) {
       speak("Right away Sir, opening Instagram.");
        window.open("https://www.instagram.com", "_blank");
        //openWithDelay("https://www.instagram.com", "Right away Sir, opening Instagram.", "_blank");
    }
    else if (cmd.includes("open google")) {
        speak("Opening Google search, Sir.");
        window.open("https://www.google.com", "_blank");
       // openWithDelay("https://www.google.com", "Opening Google search, Sir.");
    }
     else if (command.includes("open snapchat")) {
    // App opening logic
        const packageName = "com.snapchat.android";
        const intentUrl = `intent://#Intent;package=${packageName};S.browser_fallback_url=https://google.com{packageName};end`;
        speak("Opening Snapchat, Sir.");
        window.location.href = intentUrl;
         setTimeout(() => {
        window.open(intentUrl, "_blank");
    }, 500); 
      }
    

    else if (cmd.includes("search for")) {
       /* let searchTerm = cmd.replace("search for", "").trim();
        window.open(`https://google.com/search?q=${searchTerm}`, "_blank");
        speak("Searching Google for " + searchTerm);
        return;*/
        let searchTerm = comd.replace("search for", "").trim();
speak("Searching Google for " + searchTerm);
setTimeout(() => {
window.open(`https://google.com/search?q=${searchTerm}`, "_blank");
}, 1500);
    }  

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
    console.log("🛑 Stopped listening - Sync standby.");
};

// ==============================
// CUSTOM SMART SPEAK
// ==============================
function speak(text) {

    window.speechSynthesis.cancel();

    output.innerText = "JARVIS: " + text;

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    updateVisualCoreState('speaking', "JARVIS: " + text);

   // recognition.stop();

    speech.onend = () => {
        setTimeout(() => {
            try { recognition.start(); } catch(e) {}
        }, 500);
    };

    window.speechSynthesis.speak(speech);
}
