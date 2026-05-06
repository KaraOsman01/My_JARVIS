import { appState } from "./state.js";

import { setOutput } from "../ui/output.js";

import { updateVisualCoreState } from "../ui/visuals.js";

export function speak(text) {

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";

    speech.volume = 1;

    speech.rate = 1;

    speech.pitch = 1;

    appState.speaking = true;

    updateVisualCoreState(
        "speaking",
        "JARVIS: " + text
    );

    setOutput("JARVIS: " + text);

    speech.onend = () => {

        appState.speaking = false;

        updateVisualCoreState("idle");
    };

    window.speechSynthesis.speak(speech);
}
