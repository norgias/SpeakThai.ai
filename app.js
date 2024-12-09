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

// Function to Pronounce Text
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

recordButton.addEventListener('click', async () => {
  try {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'th-TH';

    recognition.start();
    recordingStatus.textContent = 'Recording... Speak now!';
    
    recognition.onresult = async (event) => {
      const spokenText = event.results[0][0].transcript;

      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(spokenText)}&langpair=th|en`);
      const data = await response.json();
      const englishTranslation = data.responseData.translatedText;

      englishOutput.textContent = englishTranslation;
      recordingStatus.textContent = 'Press the button to start recording...';
    };

    recognition.onerror = () => {
      recordingStatus.textContent = 'Recording failed. Please try again.';
    };
  } catch (error) {
    console.error(error);
    alert('Microphone access not supported in your browser.');
  }
});
