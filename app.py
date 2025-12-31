import os
import json
import base64
from flask import Flask, request, jsonify, render_template
from google.cloud import storage, speech
import vertexai
from vertexai.generative_models import GenerativeModel, Part
import requests
from datetime import datetime
import uuid
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

# ==========================================
# CONFIGURATION
# ==========================================
# app.py configuration
PROJECT_ID = os.getenv("PROJECT_ID", "tag-file-manager")
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") # Matches your env list
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "connectpro-sessions")

app = Flask(__name__)

# Initialize Google Services
vertexai.init(project=PROJECT_ID, location="us-central1")
storage_client = storage.Client(project=PROJECT_ID)
speech_client = speech.SpeechClient()
gemini_model = GenerativeModel("gemini-2.0-flash-exp")

# ElevenLabs Configuration
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"
ELEVENLABS_HEADERS = {
    "xi-api-key": ELEVENLABS_API_KEY,
    "Content-Type": "application/json"
}

@app.route("/")
def login_page():
    # This renders the executive landing page
    return render_template("login.html", client_id=CLIENT_ID)

@app.route("/dashboard")
def dashboard():
    # Your 561-line suite lives here
    return render_template("index.html", client_id=CLIENT_ID)

@app.route("/generate-script", methods=["POST"])
def generate_script():
    """Generate script using Gemini 2.0 with emotional intelligence"""
    data = request.json
    topic = data.get("topic", "Executive Leadership")
    mode = data.get("mode", "verbatim")
    lang = data.get("langName", "English")
    
    if mode == "verbatim":
        prompt = f"""You are Coach Marcus, an executive presence expert. Create a powerful 6-sentence presentation script about "{topic}" in {lang}.

CRITICAL REQUIREMENTS:
1. Use powerful executive language - confident, clear, authoritative
2. Include strategic pauses marked as [Pause - 2s] for dramatic effect
3. Add gesture cues like [Open Gesture], [Confident Stance], [Eye Contact Sweep]
4. Include vocal variety cues: [Lower Voice], [Emphasize], [Speed Up]
5. Make it feel like a TED Talk opening - hook the audience immediately

Format: Natural sentences with coaching cues in brackets. Make every word count."""
    else:
        prompt = f"""You are Coach Marcus. Provide 5 facilitator advisory points about "{topic}" in {lang}.

Focus on:
- Executive presence fundamentals
- Vocal power techniques  
- Body language that commands respect
- Audience engagement strategies
- Common pitfalls to avoid

Use bullet points with actionable insights."""
    
    try:
        response = gemini_model.generate_content(prompt)
        script_content = response.text
        
        return jsonify({
            "script": script_content,
            "coach_intro": "Alright student, let's do this!"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/coach-voice", methods=["POST"])
def coach_voice():
    """ElevenLabs TTS using the API requests style for stability"""
    text = request.json.get("text", "")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"}
    payload = {
        "text": text,
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
    }
    res = requests.post(url, json=payload, headers=headers)
    if res.status_code == 200:
        return jsonify({"audio": base64.b64encode(res.content).decode('utf-8')})
    return jsonify({"error": "Voice failed"}), 500


@app.route("/generate-audience-reaction", methods=["POST"])
def generate_audience_reaction():
    """Generate audience sound effects based on performance"""
    data = request.json
    score = data.get("score", 50)
    
    if score >= 90:
        effect = "applause"
        intensity = "enthusiastic"
    elif score >= 75:
        effect = "positive_murmur"
        intensity = "engaged"
    elif score >= 60:
        effect = "neutral_murmur"
        intensity = "attentive"
    else:
        effect = "polite_clap"
        intensity = "encouraging"
    
    try:
        sfx_url = f"{ELEVENLABS_BASE_URL}/sound-generation"
        
        payload = {
            "text": f"{intensity} audience {effect} at a professional conference",
            "duration_seconds": 3.0,
            "prompt_influence": 0.7
        }
        
        response = requests.post(sfx_url, json=payload, headers=ELEVENLABS_HEADERS)
        
        if response.status_code == 200:
            audio_base64 = base64.b64encode(response.content).decode('utf-8')
            return jsonify({
                "audio": audio_base64,
                "reaction_type": effect,
                "message": get_reaction_message(score)
            })
        else:
            return jsonify({"reaction_type": effect, "message": get_reaction_message(score)})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_reaction_message(score):
    """Get Coach Marcus reaction message"""
    if score >= 90:
        return "Outstanding! The room is yours!"
    elif score >= 75:
        return "Strong delivery. You're commanding attention."
    elif score >= 60:
        return "Good foundation. Let's refine your impact."
    else:
        return "Keep practicing. Every pro started here."

@app.route("/upload-recording", methods=["POST"])
def upload_recording():
    """Saves recording to Google Cloud Storage"""
    data = request.json
    audio_data = data.get("audio")
    session_id = data.get("session_id")
    
    bucket = storage_client.bucket(GCS_BUCKET_NAME)
    blob = bucket.blob(f"sessions/{session_id}/practice.webm")
    audio_bytes = base64.b64decode(audio_data.split(",")[1])
    blob.upload_from_string(audio_bytes, content_type="audio/webm")
    
    return jsonify({"status": "saved", "uri": f"gs://{GCS_BUCKET_NAME}/sessions/{session_id}/practice.webm"})

@app.route("/google-tts-fallback", methods=["POST"])
def google_tts_fallback():
    """Google Cloud Text-to-Speech fallback when ElevenLabs fails"""
    from google.cloud import texttospeech
    
    text = request.json.get("text", "")
    
    try:
        # Initialize Google TTS client
        tts_client = texttospeech.TextToSpeechClient()
        
        # Configure synthesis input
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        # Configure voice parameters (masculine, authoritative voice)
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Neural2-D",  # Deep male voice
            ssml_gender=texttospeech.SsmlVoiceGender.MALE
        )
        
        # Configure audio format
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=1.0,
            pitch=0.0
        )
        
        # Perform synthesis
        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # Return base64 encoded audio
        audio_base64 = base64.b64encode(response.audio_content).decode('utf-8')
        return jsonify({"audio": audio_base64})
        
    except Exception as e:
        print(f"Google TTS Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/multimodal-assessment", methods=["POST"])
def multimodal_assessment():
    """Analyze video/audio using Vertex AI multimodal capabilities"""
    data = request.json
    transcript = data.get("transcript", "")
    mistakes = data.get("mistakes", [])
    score = data.get("score", 0)
    fillers = data.get("fillers", 0)
    session_id = data.get("session_id", "")
    
    prompt = f"""You are Coach Marcus, an elite executive presence coach. Analyze this presentation performance.

**Performance Metrics:**
- Accuracy Score: {score}/100
- Filler Words (um, ah, er): {fillers}
- Pronunciation Challenges: {', '.join(mistakes) if mistakes else 'None detected'}

**Transcript:**
{transcript}

Provide a comprehensive executive coaching assessment in this format:

## 🎯 Executive Presence Score: [X]/10

## 💪 Strengths
[2-3 specific things they did exceptionally well]

## 🎓 Growth Opportunities
[2-3 specific areas for improvement with actionable advice]

## 🔥 Power Moves to Practice
[3 concrete techniques to elevate their next presentation]

## 💬 Coach Marcus Says:
[Personal, encouraging insight in 2 sentences - be authentic and motivating]

Be direct, actionable, and motivating. This is high-level executive coaching."""

    try:
        # Try to get recording from GCS if it exists
        gcs_uri = None
        try:
            bucket = storage_client.bucket(GCS_BUCKET_NAME)
            blobs = list(bucket.list_blobs(prefix=f"sessions/{session_id}/"))
            if blobs:
                # Get the most recent recording
                latest_blob = sorted(blobs, key=lambda b: b.time_created, reverse=True)[0]
                gcs_uri = f"gs://{GCS_BUCKET_NAME}/{latest_blob.name}"
        except Exception as e:
            print(f"Could not retrieve recording from GCS: {e}")
        
        # Generate assessment with or without audio
        if gcs_uri:
            try:
                video_part = Part.from_uri(gcs_uri, mime_type="audio/webm")
                response = gemini_model.generate_content([prompt, video_part])
            except Exception as e:
                print(f"Could not analyze audio: {e}, proceeding without it")
                response = gemini_model.generate_content(prompt)
        else:
            response = gemini_model.generate_content(prompt)
        
        feedback = response.text
        
        return jsonify({
            "feedback": feedback,
            "has_multimodal": bool(gcs_uri)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)