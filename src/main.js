import { startRecognition }
from "./core/recognition.js";

console.log("JARVIS initialized.");

window.onload = () => {

    const micBtn =
        document.getElementById("micBtn");

    if (micBtn) {

        micBtn.addEventListener(
            "click",
            () => {

                startRecognition();
            }
        );
    }
};
