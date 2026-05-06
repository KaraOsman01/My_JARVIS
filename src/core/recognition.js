import { handleCommand }
from "../commands/index.js";

import { updateVisualCoreState }
from "../ui/visuals.js";

const SpeechRecognition =
    window.SpeechRecognition
    ||
    window.webkitSpeechRecognition;

const recognition =
    new SpeechRecognition();

recognition.lang = "en-IN";

recognition.continuous = false;

recognition.interimResults = false;

let isRecognitionActive = false;

// =======================
// START
// =======================

recognition.onstart = () => {

    console.log("Mic started");

    isRecognitionActive = true;

    updateVisualCoreState("listening");
};

// =======================
// RESULT
// =======================

recognition.onresult = async (event) => {

    const transcript =
        event.results[0][0].transcript;

    console.log("User said:", transcript);

    await handleCommand(transcript);
};

// =======================
// END
// =======================

recognition.onend = () => {

    console.log("Mic ended");

    isRecognitionActive = false;

    updateVisualCoreState("idle");
};

// =======================
// ERROR
// =======================

recognition.onerror = (event) => {

    console.log(
        "Recognition error:",
        event.error
    );

    isRecognitionActive = false;
};

// =======================
// SAFE START
// =======================

export function startRecognition() {

    if (isRecognitionActive) return;

    try {

        recognition.start();

    } catch (err) {

        console.log(
            "Mic start blocked:",
            err
        );
    }
}
