console.log("Script loaded successfully");

const micBtn = document.getElementById("micBtn");
const voiceInput = document.getElementById("voiceInput");
const statusText = document.getElementById("status-text");
const outputBox = document.getElementById("outputBox");

const backendUrl = 'http://localhost:3000/api/generate-code';


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";


    recognition.onstart = () => {
        statusText.textContent = "🎙️ Listening...";
        micBtn.classList.add('is-recording');
    };

    recognition.onend = () => {
        statusText.textContent = "Click the mic to start speaking...";
        micBtn.classList.remove('is-recording');
    };

    recognition.onerror = (event) => {
        statusText.textContent = `❌ Error: ${event.error}. Please try again.`;
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        voiceInput.value = transcript;
        statusText.textContent = "🧠 Processing your request...";


        sendToServer(transcript);
    };

} else {

    statusText.textContent = "❌ Speech Recognition is not supported in this browser.";
    micBtn.disabled = true;
}


micBtn.addEventListener("click", () => {
    if (recognition) {
        recognition.start();
    }
});



async function sendToServer(command) {

    const context = window.getSelection().toString();

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                command: command,
                context: context
            })
        });

        if (!response.ok) {
            throw new Error(`Server responded with an error: ${response.status}`);
        }

        const data = await response.json();
        const generatedCode = data.code;


        printMessage(generatedCode);
        statusText.textContent = "✅ Your code is ready!";

    } catch (error) {
        console.error("Error communicating with backend:", error);
        statusText.textContent = "🔥 Error: Could not connect to the backend.";
    }
}




function printMessage(message) {
    outputBox.innerHTML = '';

    let i = 0;
    function typeChar() {
        if (i < message.length) {
            outputBox.textContent += message.charAt(i);
            i++;

            outputBox.scrollTop = outputBox.scrollHeight;
            setTimeout(typeChar, 15);
        }
    }
    typeChar();
}