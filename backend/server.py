import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import deepspeech
import numpy as np
import wave

# Function to download models
def download_model(url, save_path):
    """Download a file from the specified URL and save it to the given path."""
    print(f"Downloading from {url}...")
    response = requests.get(url, stream=True)
    response.raise_for_status()  # Ensure the request was successful
    with open(save_path, 'wb') as file:
        for chunk in response.iter_content(chunk_size=8192):  # Download in chunks
            file.write(chunk)
    print(f"Saved to {save_path}")

# URLs for DeepSpeech model and scorer from Mozilla's GitHub
MODEL_URL = 'https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.pbmm'
SCORER_URL = 'https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models.scorer'

# Download the model and scorer files
download_model(MODEL_URL, 'deepspeech-0.9.3-models.pbmm')
download_model(SCORER_URL, 'deepspeech-0.9.3-models.scorer')

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load DeepSpeech model
MODEL_FILE_PATH = 'deepspeech-0.9.3-models.pbmm'
SCORER_FILE_PATH = 'deepspeech-0.9.3-models.scorer'
model = deepspeech.Model(MODEL_FILE_PATH)
model.enableExternalScorer(SCORER_FILE_PATH)

def convert_audio_to_wav(audio_path):
    """Convert audio file to WAV format required by DeepSpeech."""
    with wave.open(audio_path, 'rb') as wf:
        assert wf.getnchannels() == 1, "Audio must be mono."
        assert wf.getsampwidth() == 2, "Audio must be 16-bit."
        assert wf.getframerate() == 16000, "Audio must be 16kHz."
        audio = np.frombuffer(wf.readframes(wf.getnframes()), np.int16)
    return audio

@app.route('/recognize', methods=['POST'])
def recognize():
    """Handle audio recognition requests."""
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file uploaded.'}), 400
    
    audio_file = request.files['audio']
    audio_path = './uploaded_audio.wav'
    audio_file.save(audio_path)
    
    try:
        audio = convert_audio_to_wav(audio_path)
        transcription = model.stt(audio)
        return jsonify({'transcription': transcription})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
