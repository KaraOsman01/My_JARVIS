import {
    openYoutube,
    openGoogle
}
from "./apps.js";

import { askGemini }
from "../ai/gemini.js";

import { speak }
from "../core/speech.js";

export async function handleCommand(command) {

    command = command.toLowerCase();

    if (command.includes("youtube")) {

        return openYoutube();
    }

    if (command.includes("google")) {

        return openGoogle();
    }

    const reply = await askGemini(command);

    speak(reply);
}
