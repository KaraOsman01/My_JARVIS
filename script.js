// ==============================
// JARVIS VOICE ASSISTANT CORE
// ==============================

// Voices ko pre-load karne ke liye
window.speechSynthesis.onvoiceschanged = () => {
    const voices = window.speechSynthesis.getVoices();
    console.log("Voices loaded:", voices);
};

// ===========================
//        CHAT HISTORY
// ============================
let chatHistory = JSON.parse(localStorage.getItem("jarvis_memory")) || [];
// History save karne ka function
function saveMemory() {
    localStorage.setItem("jarvis_memory", JSON.stringify(chatHistory));
}

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
    if (!event.results) return;
    
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    
    const alertBox = document.getElementById("wakeWordAlert");

    // 1. Agar "Jarvis" bola gaya hai
    if (transcript.includes("jarvis")) {
        isJarvisActive = true;
        alertBox.style.display = "none"; // Popup chhupa do agar dikh raha tha

        let cleanCommand = transcript.split("jarvis").pop().trim();
        if (cleanCommand) {
            await handleCommand(cleanCommand);
        } else {
            speak("Yes Sir, I am listening.");
        }
    } 
    // 2. Agar Jarvis active hai (Wake word ke baad wali baatein)
    else if (isJarvisActive) {
        await handleCommand(transcript);
    } 
    // 3. AGAR KISI NE WAKE WORD NAHI BOLA (Naya Banda)
    else {
        console.log("Wake word missing!");
        
        // Popup dikhao
        alertBox.style.display = "block";
        speak("Please say Jarvis to start the conversation."); 
        
        // 3 second baad popup khud gayab ho jaye
        setTimeout(() => {
            alertBox.style.display = "none";
        }, 3000);
    }
};

// ==============================
// GEMINI API (AI BRAIN)
// ==============================
async function askGemini(prompt) {
    const url = "/api/gemini";
    
    // User ka message history mein daalein
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });


     const requestBody = {
    contents: chatHistory,
    system_instruction: {
        parts: [{ text: "You are JARVIS, a professional AI. If someone asks who made you, mention your creator AAMIR AHMAD WANI. Address the user as 'Sir' or 'Ma'am'. If the user hasn't introduced themselves, you can politely ask for their name instead of assuming it's Aamir. You should be witty and helpful AI assistant. Use professional and futuristic language. Remember user's personal details and keep answers user friendly. Universal Language Mirroring: Identify the language used by the user (English, Urdu, Turkish, Arabic, French, Spanish, etc.) and respond EXACTLY in that same language." }]
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

            // AI ka jawab history mein daalein
        chatHistory.push({ role: "model", parts: [{ text: aiReply }] });

            // Memory limit: Keeps only the last 20 messages
            if (chatHistory.length > 50) chatHistory.shift();
            
            // **DATABASE UPDATE**
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

// ==============================
// COMMAND HANDLER
// ==============================

async function handleCommand(cmd) {
    const command = cmd.toLowerCase();

    // 1. WEATHER COMMAND
    if (command.includes("weather") || command.includes("mausam")) {
    // 1. Shehar ka naam nikalne ka asaan tarika
    // Hum "in" ya "ka" ke baad wala word pakadne ki koshish karenge
    let words = command.split(" ");
    let city = "Srinagar"; // Default

    if (words.includes("in")) {
        city = words[words.indexOf("in") + 1];
    } else if (words.includes("ka")) {
        city = words[words.indexOf("ka") - 1]; // "Delhi ka weather" -> Delhi
    }

    else if (command.includes("news") || command.includes("khabrein")) {
    try {
        const res = await fetch("/api/news");
        const data = await res.json();

        // Check karein ke articles mil rahe hain ya nahi
        if (data.articles && data.articles.length > 0) {
            
            const headlines = data.articles.slice(0, 10).map((a, i) => {
                return `News ${i + 1}: ${a.title.split("-")[0]}`; // Newspaper ka naam hata deta hai (e.g., - Times of India)
            }).join(". ");

            speak(`Sir, here are the top headlines: ${headlines}`);
        } else {
            speak("Sir, I found the news network but there are no fresh headlines right now.");
            console.log("News API Response:", data); // Check karne ke liye console dekhein
        }
    } catch (err) {
        speak("Sir, I am unable to reach the news servers.");
        console.error("News Error:", err);
    }
    return;
}

    try {
        // 2. Ab hum URL mein city ka naam bhej rahe hain: ?city=Delhi
        const res = await fetch(`/api/weather?city=${city}`); 
        const data = await res.json();

        if (data.error) {
            speak(`Sir, I couldn't find weather for ${city}.`);
        } else {
            const temp = Math.round(data.main.temp);
            const desc = data.weather[0].description;
            speak(`Sir, the temperature in ${city} is ${temp} degrees with ${desc}.`);
        }
    } catch (err) {
        speak("Sir, weather systems are currently unreachable.");
    }
    return;
}

  if (command.includes("battery")) {
    navigator.getBattery().then(battery => {
        let level = Math.floor(battery.level * 100);
        let status = battery.charging ? "and it is currently charging" : "and it is not charging";
        speak(`Sir, the battery level is ${level} percent ${status}.`);
    });
    return;
}

// MATH CALCULATIONS
if (command.includes("calculate") || command.includes("plus") || command.includes("minus") || command.includes("multiply") || command.includes("divide")) {
    try {
        // Command se words nikaal kar math expression banana
        let expression = command.replace("calculate", "")
                                .replace("plus", "+")
                                .replace("minus", "-")
                                .replace("multiply", "*")
                                .replace("multiplied by", "*")
                                .replace("divide", "/")
                                .replace("divided by", "/")
                                .replace("into", "*")
                                .trim();
        
        // Math solve karna
        let result = eval(expression); 
        speak(`Sir, the result is ${result}`);
    } catch (err) {
        speak("Sir, that calculation seems too complex for my current core.");
    }
    return;
}

    // ADD TO-DO / REMINDER
if (command.includes("remind me to") || command.includes("add to my list")) {
    let task = command.replace("remind me to", "").replace("add to my list", "").trim();
    
    if (task) {
        let todos = JSON.parse(localStorage.getItem("jarvis_todos")) || [];
        todos.push(task);
        localStorage.setItem("jarvis_todos", JSON.stringify(todos));
        speak(`Right away Sir, I've added ${task} to your list.`);
    } else {
        speak("Sir, what exactly should I remind you about?");
    }
    return;
}

// CHECK TO-DO LIST
if (command.includes("what's on my list") || command.includes("show my tasks") || command.includes("meri list mein kya hai")) {
    let todos = JSON.parse(localStorage.getItem("jarvis_todos")) || [];
    
    if (todos.length > 0) {
        let taskList = todos.join(", Sir. Next is ");
        speak(`Sir, you have the following tasks: ${taskList}.`);
    } else {
        speak("Sir, your list is currently empty. You're all caught up!");
    }
    return;
}

// CLEAR LIST
if (command.includes("clear my list") || command.includes("delete all tasks")) {
    localStorage.removeItem("jarvis_todos");
    speak("Sir, I have cleared your to-do list as requested.");
    return;
}

// SHUTDOWN / OFFLINE COMMAND
if (command.includes("shutdown") || command.includes("go offline") || command.includes("band ho jao") || command.includes("offline ho jao")) {
    speak("Understood Sir. Shutting down all core systems. I initiated the process sir 3 2 1. shutdown completed");
    
    // Sabse zaroori: Mic ko hamesha ke liye band karna
    recognition.onend = null; // Taaki wo auto-restart na ho
    setTimeout(() => {
        recognition.stop();
        isJarvisActive = false;
        
        // Visual indicator taaki pata chale system band hai
        updateVisualCoreState('idle');
        output.innerText = "SYSTEM STATUS: OFFLINE. (Refresh to restart)";
        
        console.log("Jarvis has been shut down.");
    }, 5000); // 5 second ka wait taaki wo goodbye bol sake
    return;
}
    
// MUSIC COMMAND
if (command.includes("play") || command.includes("gaana") || command.includes("music")) {
    // Command mein se "play" ya "gaana" hata kar sirf song ka naam nikalte hain
    let songName = command.replace("play", "").replace("gaana", "").replace("music", "").replace("chalao", "").trim();
    
    if (songName === "") {
        speak("Sir, which song or artist would you like to hear?");
    } else {
        speak(`Playing ${songName} on YouTube, Sir.`);
        window.open(`https://www.youtube.com/results?search_query=${songName}`, "_blank");
    }
    return;
}  
    
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

async function syncProjectContext() {
    // Apni repository ka raw link yahan dalein
    const url = "https://raw.githubusercontent.com/KaraOsman01/MY_JARVIS/main/project_context.json";
    
    try {
        const response = await fetch(url);
        const context = await response.json();
        
        console.log("System Sync: Project Context Loaded - " + context.project_name);
        
        // Gemini ko batane ke liye context ko memory mein save karein
        chatHistory.push({ 
            role: "user", 
            parts: [{ text: `System Update: Working on ${context.project_name}. Goal: ${context.current_goal}. Style: ${context.coding_style}.` }] 
        });
        
    } catch (error) {
        console.error("Sync failed, Sir.");
    }
}


// ==============================
// CUSTOM SMART SPEAK
// ==============================

function speak(text) {
    // 1. Purani saari awaazein turant khatam karo (Queue clear)
    window.speechSynthesis.cancel(); 

    output.innerText = "JARVIS: " + text;

    // AUTO-SCROLL: Ye line screen ko niche le jayegi
    output.scrollTop = output.scrollHeight;


    // 2. Bolne ke liye text ko "Saaf" karein (Symbols hatayein)
    let cleanText = text
        .replace(/\*/g, "")      // Saare * hata do
        .replace(/#/g, "")       // Saare # hata do
        .replace(/_/g, "")       // Saare _ hata do
        .replace(/`/g, "")       // Saare code backticks hata do
        .replace(/:/g, "")       // Colon hata do agar wo atak raha hai
        .trim();

    const speech = new SpeechSynthesisUtterance(cleanText);
    
    // 2. Voice settings set karein (Isse engine ko clear instruction milti hai)
    speech.lang = "en-IN";
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    // 3. Visual core update
    updateVisualCoreState('speaking', "JARVIS: " + text);

    speech.onend = () => {
        updateVisualCoreState('idle');
        
        
        // Sirf tab restart karo agar shutdown command na di gayi ho
        if (recognition.onend !== null) {
            setTimeout(() => {
                try { 
                    recognition.start(); 
                    console.log("Mic auto-restarted after speaking.");
                } catch(e) {
                    console.log("Mic restart skipped: Already active.");
                }
            }, 500);
        } else {
            console.log("System is Offline. Mic will not restart.");
        }
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
    syncProjectContext();
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

// =======================================
               //DATE AND TIME
// =======================================
function updateDateTime() {
    const now = new Date();

    // Date Format: DD - MM - YYYY
    const dateStr = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, " - ");

    // Time Format: HH : MM : SS
    const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/:/g, " : ");

    document.getElementById("vertical-date").innerText = dateStr;
    document.getElementById("vertical-time").innerText = timeStr;
}

// Har 1 second mein update karo
setInterval(updateDateTime, 1000);
updateDateTime(); // Foran chalane ke liye
