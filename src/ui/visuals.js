import { setOutput } from "./output.js";

export function updateVisualCoreState(state, text = "") {

    const micContainer = document.querySelector(".mic-btn-container");

    if (!micContainer) return;

    micContainer.classList.remove(
        "reactive-listen",
        "reactive-speak"
    );

    if (state === "listening") {

        micContainer.classList.add("reactive-listen");

        setOutput(text || "System Listening...");

    }

    else if (state === "speaking") {

        micContainer.classList.add("reactive-speak");

        setOutput(text || "Jarvis Speaking...");

    }

    else {

        setOutput("System Idle.");

    }
}
