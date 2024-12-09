// Function to Translate Text (First Section)
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

// Function to Pronounce Thai Text
document.getElementById('speakButton').addEventListener('click', () => {
  const thaiText = document.getElementById('speakButton').dataset.text;

  const utterance = new SpeechSynthesisUtterance(thaiText);
  utterance.lang = 'th-TH';
  speechSynthesis.speak(utterance);
});

// Function to Record Audio and Translate (Second Section)
const recordButton = document.getElementById('recordButton');
const recordingStatus = document.getElementById('recordingStatus');
const englishOutput = document.getElementById('englishOutput');
const englishSpeakButton = document.getElementById('englishSpeakButton');

let recognition;

if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'th-TH';
  recognition.continuous = false;

  // Start recording when holding down the button
  recordButton.addEventListener('mousedown', () => {
    recordingStatus.textContent = 'Recording... Speak now!';
    recognition.start();
  });

  // Stop recording and process when the button is released
  recordButton.addEventListener('mouseup', async () => {
    recordingStatus.textContent = 'Analyzing... Please wait.';
    recognition.stop();

    recognition.onresult = async (event) => {
      const spokenText = event.results[0][0].transcript;

      try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(spokenText)}&langpair=th|en`);
        const data = await response.json();
        const englishTranslation = data.responseData.translatedText;

        englishOutput.textContent = englishTranslation;
        recordingStatus.textContent = 'Press and hold the button to record again.';
        englishSpeakButton.disabled = false;
        englishSpeakButton.dataset.text = englishTranslation;
      } catch (error) {
        console.error(error);
        alert('Error translating. Please try again.');
        recordingStatus.textContent = 'Press and hold the button to record again.';
      }
    };

    recognition.onerror = () => {
      recordingStatus.textContent = 'Recording failed. Please try again.';
    };
  });
} else {
  alert('Speech recognition is not supported in your browser.');
}

// Function to Pronounce English Output
englishSpeakButton.addEventListener('click', () => {
  const englishText = englishSpeakButton.dataset.text;

  const utterance = new SpeechSynthesisUtterance(englishText);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
});
