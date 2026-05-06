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

recognition.onstart = () => {

    updateVisualCoreState("listening");
};

recognition.onresult = async (event) => {

    const transcript =
        event.results[0][0].transcript;

    await handleCommand(transcript);
};

recognition.onend = () => {

    setTimeout(() => {

        recognition.start();

    }, 500);
};

export function startRecognition() {

    recognition.start();
}
