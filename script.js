// ==============================
// JARVIS VOICE ASSISTANT CORE
// ==============================
let chatHistory = []; 

let isJarvisActive = false; 
let sessionTimeout;

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


     // STEP 1: Pehle check karo "Jarvis" bola gaya hai?
    if (transcript.includes("jarvis")) {
        isJarvisActive = true;
        
        // Timer reset karein (agar 30 seconds tak kuch na bola toh Jarvis so jayega)
        clearTimeout(sessionTimeout);
        sessionTimeout = setTimeout(() => {
            isJarvisActive = false;
            console.log("Jarvis went to sleep...");
        }, 30000); 

        let cleanCommand = transcript.split("jarvis").pop().trim();
        
        if (cleanCommand) {
            await handleCommand(cleanCommand);
        } else {
            speak("Yes Sir, I am listening.");
        }
    } 
    // STEP 2: Agar Jarvis pehle se active hai, toh bina naam liye kaam karo
    else if (isJarvisActive) {
        // Timer refresh karein har baar jab aap baat karein
        clearTimeout(sessionTimeout);
        sessionTimeout = setTimeout(() => {
            isJarvisActive = false;
        }, 30000);

        await handleCommand(transcript);
    }
    // STEP 3: Agar Jarvis so raha hai aur aapne naam nahi liya
    else {
        console.log("Jarvis is sleeping. Say 'Jarvis' to wake him up.");
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
     else if (cmd.includes("open snapchat")) {
          speak("Opening SnapChat, sir");
          window.open("https://www.snapchat.com", "_blank");
      }
    

    else if (cmd.includes("search for")) {
       
        let searchTerm = cmd.replace("search for", "").trim();
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
/*function speak(text) {

    window.speechSynthesis.cancel();

    output.innerText = "JARVIS: " + text;

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    updateVisualCoreState('speaking', "JARVIS: " + text);

   // recognition.stop();

    speech.onend = () => {

        updateVisualCoreState('idle');
    setTimeout(() => {
        try { 
            recognition.start(); 
            console.log("Mic auto-restarted after speaking.");
        } catch(e) {
            console.log("Mic restart skipped: Already active.");
        }
    }, 500);

    };

    window.speechSynthesis.speak(speech);
}*/

function speak(text) {
    // 1. Purani saari awaazein turant khatam karo (Queue clear)
    window.speechSynthesis.cancel(); 

    output.innerText = "JARVIS: " + text;

    const speech = new SpeechSynthesisUtterance(text);
    
    // 2. Voice settings set karein (Isse engine ko clear instruction milti hai)
    speech.lang = "en-IN";
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    // 3. Visual core update
    updateVisualCoreState('speaking', "JARVIS: " + text);

    // 4. Jab tak Jarvis bol raha ho, mic ko band rakhein
   // try { recognition.stop(); } catch(e) {}

    speech.onend = () => {
        updateVisualCoreState('idle');
        // Jawab khatam hote hi mic foran restart
        setTimeout(() => {
        try { 
            recognition.start(); 
            console.log("Mic auto-restarted after speaking.");
        } catch(e) {
            console.log("Mic restart skipped: Already active.");
        }
    }, 500);
    };

    // 5. Execution (Foran bolne ke liye)
    window.speechSynthesis.speak(speech);
}

// Jab aap wapas Jarvis wale tab par aayein, tab mic ko reset karein
window.onfocus = () => {
    console.log("Tab focused. Resetting Jarvis system...");
    
    // Agar recognition stop ho chuki hai, toh ise restart karein
    try {
        recognition.stop(); // Pehle purani state clear karein
        setTimeout(() => {
            recognition.start();
            updateVisualCoreState('idle'); // Visuals ko reset karein
            output.innerText = "Welcome back, Sir. I am ready.";
        }, 500);
    } catch(e) {
        console.log("Recognition restart failed, likely already running.");
    }
};

// Save history before refresh
window.onbeforeunload = () => {
    localStorage.setItem("jarvis_memory", JSON.stringify(chatHistory));
};

// Load history on startup
window.onload = () => {
    const saved = localStorage.getItem("jarvis_memory");
    if (saved) chatHistory = JSON.parse(saved);
};

function resetMicSystem() {
    console.log("Re-initializing Mic Engine...");
    
    // Purane recognition ko stop karo
    try { recognition.stop(); } catch(e) {}

    // 1 second ruko phir restart karo
    setTimeout(() => {
        try {
            recognition.start();
            output.innerText = "System Restored. I am listening, Sir.";
            updateVisualCoreState('idle');
        } catch(e) {
            // Agar phir bhi error de, toh majbooran refresh kar do
            location.reload(); 
        }
    }, 1000);
}

// Jab wapas aayein toh reset call karein
window.onfocus = () => {
    resetMicSystem();
};

