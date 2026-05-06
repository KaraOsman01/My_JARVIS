import { speak } from "../core/speech.js";

export function openYoutube() {

    speak("Opening YouTube");

    window.open(
        "https://youtube.com",
        "_blank"
    );
}

export function openGoogle() {

    speak("Opening Google");

    window.open(
        "https://google.com",
        "_blank"
    );
}
