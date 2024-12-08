// Function to Translate Text
document.getElementById('translateButton').addEventListener('click', async () => {
  const englishText = document.getElementById('englishInput').value;

  if (!englishText) {
    alert('Please type something to translate.');
    return;
  }

  try {
    // Mock API Call - Replace with real translation API later
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText)}&langpair=en|th`);
    const data = await response.json();
    const thaiTranslation = data.responseData.translatedText;

    // Display Translation
    document.getElementById('thaiOutput').textContent = thaiTranslation;

    // Enable Speak Button
    document.getElementById('speakButton').disabled = false;

    // Save Translation for Pronunciation
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
