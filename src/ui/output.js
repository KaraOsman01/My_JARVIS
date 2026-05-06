export function setOutput(text) {

    const output = document.getElementById("output");

    if (!output) return;

    output.innerText = text;

    output.scrollTop = output.scrollHeight;
}
