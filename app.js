// Function to request microphone access
async function requestMicrophoneAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Microphone access granted.");
    // Stop all tracks after permission is granted
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error("Microphone access denied:", error.message);
    alert("Microphone access is required to use this feature. Please allow microphone access in your browser settings.");
    return false;
  }
}

// First Translator Section: English to Thai
document.getElementById('translateButton').addEventListener('click', async () => {
  const englishText = document.getElementById('englishInput').value;

  if (!englishText) {
    alert('Please type something to translate.');
    return;
  }

  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText)}&langpair=en|th`);
    const data = await response.json();
    const thaiTranslation = data.responseData.translatedText;

    document.getElementById('thaiOutput').textContent = thaiTranslation;
    document.getElementById('speakButton').disabled = false;
    document.getElementById('speakButton').dataset.text = thaiTranslation;

  } catch (error) {
    console.error(error);
    alert('Error translating. Please try again later.');
  }
});

// Pronounce Thai Text
document.getElementById('speakButton').addEventListener('click', () => {
  const thaiText = document.getElementById('speakButton').dataset.text;

  const utterance = new SpeechSynthesisUtterance(thaiText);
  utterance.lang = 'th-TH';
  speechSynthesis.speak(utterance);
});

// Second Translator Section: Thai Speech to English
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const recordingStatus = document.getElementById('recordingStatus');
const englishOutput = document.getElementById('englishOutput');
const englishSpeakButton = document.getElementById('englishSpeakButton');

let recognition;

if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'th-TH';
  recognition.continuous = false;

  // Start recording
  recordButton.addEventListener('click', async () => {
    const hasPermission = await requestMicrophoneAccess();
    if (!hasPermission) {
      recordingStatus.textContent = 'Microphone permission is required.';
      return;
    }

    recordingStatus.textContent = 'Recording... Speak now!';
    recognition.start();
    recordButton.disabled = true;
    stopButton.disabled = false;
  });

  // Stop recording
  stopButton.addEventListener('click', async () => {
    recordingStatus.textContent = 'Analyzing... Please wait.';
    recognition.stop();
    recordButton.disabled = false;
    stopButton.disabled = true;

    recognition.onresult = async (event) => {
      const spokenText = event.results[0][0].transcript;

      try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(spokenText)}&langpair=th|en`);
        const data = await response.json();
        const englishTranslation = data.responseData.translatedText;

        englishOutput.textContent = englishTranslation;
        recordingStatus.textContent = 'Recording complete. You can start again.';
        englishSpeakButton.disabled = false;
        englishSpeakButton.dataset.text = englishTranslation;
      } catch (error) {
        console.error(error);
        alert('Error translating. Please try again later.');
        recordingStatus.textContent = 'Press "Start Recording" to try again.';
      }
    };

    recognition.onerror = () => {
      recordingStatus.textContent = 'Recording failed. Please try again.';
      recordButton.disabled = false;
      stopButton.disabled = true;
    };
  });
} else {
  alert('Speech recognition is not supported in your browser.');
}

// Pronounce English Output
englishSpeakButton.addEventListener('click', () => {
  const englishText = englishSpeakButton.dataset.text;

  const utterance = new SpeechSynthesisUtterance(englishText);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
});
