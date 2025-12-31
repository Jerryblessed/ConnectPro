# ConnectPro | Executive Suite - Coach Marcus Edition

**AI-Powered Executive Presence Training Platform**

ConnectPro is a cutting-edge presentation coaching application that combines Google Cloud AI, real-time speech recognition, and multimodal analysis to help executives master their communication skills.

![ConnectPro Banner](https://img.shields.io/badge/AI-Powered-blue) ![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Vertex%20AI-orange) ![Status](https://img.shields.io/badge/Status-Production-green)

---

## 🎯 Overview

ConnectPro transforms presentation training by providing:
- **Real-time speech analysis** with live feedback
- **AI-generated scripts** tailored to your topic and style
- **Multimodal coaching** using voice, text, and performance metrics
- **Executive presence scoring** with actionable insights
- **Professional voice synthesis** for script playback and coaching

---

## ✨ Key Features

### 🎙️ **AI Script Generation**
- Powered by **Gemini 2.0 Flash** (Vertex AI)
- Two modes: **Full Script** (verbatim) and **Key Points Only** (advisory)
- Multilingual support: English, French, German, Spanish
- Includes coaching cues: pauses, gestures, vocal variety

### 📊 **Real-Time Performance Tracking**
- **Delivery Score**: Tracks word-for-word accuracy against your script
- **Filler Detection**: Counts "um", "uh", "like", and other filler words
- **Audience Engagement**: Dynamic feedback (Waiting → Attentive → Engaged → Captivated)
- **Focus Areas**: Identifies pronunciation challenges and off-script moments

### 🎬 **Live Speech Recognition**
- Browser-based speech-to-text using Web Speech API
- Real-time word highlighting as you speak
- Instant metrics updates during practice sessions
- Multi-language support for international speakers

### 🤖 **Coach Marcus AI**
- Personalized coaching feedback using Gemini 2.0
- Multimodal analysis of audio recordings
- Executive presence scoring (1-10)
- Specific, actionable improvement recommendations

### 🔊 **Professional Voice Synthesis**
- Primary: **ElevenLabs** (premium, human-like voice)
- Fallback: **Google Cloud Text-to-Speech** (reliable backup)
- Automatic failover for uninterrupted experience
- Script playback and coach voice intro

### 💬 **Interactive Voice Chat (ElevenLabs Conversational AI)**
- Live voice conversations with Coach Marcus
- Real-time coaching guidance during practice
- Natural language understanding
- Context-aware responses
- Always-available virtual coaching assistant

### 📈 **Session Management**
- Google Cloud Storage integration
- Session recordings saved for analysis
- Persistent performance history
- Secure authentication via Google Sign-In

---

## 🏗️ Architecture

### **Tech Stack**

#### Frontend
- **HTML5** + **Tailwind CSS** for modern, responsive UI
- **Vanilla JavaScript** for real-time interactions
- **Web Speech API** for browser-based speech recognition
- **Marked.js** for markdown rendering
- **ElevenLabs Conversational AI Widget** for voice chat

#### Backend
- **Flask** (Python 3.11+)
- **Google Cloud Vertex AI** (Gemini 2.0 Flash)
- **Google Cloud Storage** (session recordings)
- **Google Cloud Speech-to-Text** (transcription)
- **Google Cloud Text-to-Speech** (fallback voice)
- **ElevenLabs API** (premium voice synthesis)

#### Infrastructure
- **Google Cloud Platform**
- **Cloud Run** or **App Engine** deployment
- **Service Account** with Vertex AI, Storage, and Speech permissions

---

## 🚀 Getting Started

### **Prerequisites**

1. **Google Cloud Project** with billing enabled
2. **APIs Enabled**:
   - Vertex AI API
   - Cloud Storage API
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
3. **ElevenLabs Account** (free tier available)
4. **Google OAuth 2.0 Client ID** for authentication

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/connectpro.git
   cd connectpro
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables**
   ```bash
   export GCP_PROJECT_ID="your-project-id"
   export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   export ELEVENLABS_API_KEY="sk_your_elevenlabs_key"
   export ELEVENLABS_VOICE_ID="your_voice_id"
   export GCS_BUCKET_NAME="your-bucket-name"
   ```
   
   **Note**: The ElevenLabs Conversational AI widget (`agent_0801kdppe0vjee8a7ypw4txexjnn`) is already configured in the HTML. To customize it, create your own agent at [ElevenLabs](https://elevenlabs.io/conversational-ai) and replace the `agent-id` in `index.html`.

4. **Create GCS bucket**
   ```bash
   gsutil mb gs://your-bucket-name
   ```

5. **Run locally**
   ```bash
   python app.py
   ```

6. **Access the app**
   ```
   http://localhost:8080
   ```

---

## 📦 Deployment

### **Deploy to Google Cloud Run**

```bash
gcloud run deploy connectpro \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=your-project-id,ELEVENLABS_API_KEY=your-key
```

### **Deploy to App Engine**

```bash
gcloud app deploy
```

---

## 🎮 Usage

### **1. Sign In**
- Click "Sign in with Google"
- Authorize the application

### **2. Generate a Script**
- Select mode: **Full Script** or **Key Points Only**
- Choose language
- Enter your topic (e.g., "Innovation Strategy")
- Click **Generate Script**

### **3. Practice Your Delivery**
- Click **RECORD** (after 3-2-1 countdown)
- Read your script aloud
- Watch real-time metrics update:
  - Words turn **green** as you say them
  - **Delivery Score** increases
  - **Filler count** tracks hesitations
  - **Audience Energy** reflects performance

### **4. Stop and Review**
- Click **STOP** when finished
- Review your metrics
- Click **Get Coaching** for AI analysis

### **5. Receive Coaching**
- Executive Presence Score (1-10)
- Strengths identified
- Growth opportunities
- Power moves to practice
- Personal message from Coach Marcus

### **6. Chat with Coach Marcus (Optional)**
- Click the **ElevenLabs chat widget** (bottom-right corner)
- Ask questions about your presentation
- Get real-time coaching advice
- Discuss strategies for improvement
- Practice with voice-to-voice conversation

---

## 📊 Performance Metrics

### **Delivery Score**
- Calculates word-matching accuracy in real-time
- Updates as you speak each word
- Range: 0% to 100%

### **Filler Words**
Detects common fillers:
- um, uh, ah, er
- like, you know
- so, basically

### **Audience Engagement Levels**
- 😐 **Waiting** (0-59%): Building momentum
- 👀 **Attentive** (60-74%): Gaining interest
- 👏 **Engaged** (75-89%): Strong delivery
- 🔥 **Captivated** (90-100%): Commanding presence

---

## 🔒 Security

- **Google OAuth 2.0** for authentication
- **Session tokens** stored securely
- **Service Account** credentials via environment variables
- **No API keys** exposed to frontend
- **HTTPS required** for production

---

## 🛠️ Configuration

### **Environment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `GCP_PROJECT_ID` | Your Google Cloud project ID | `my-project-12345` |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID | `123-abc.apps.googleusercontent.com` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | `sk_abc123...` |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID | `Fahco4VZzob...` |
| `GCS_BUCKET_NAME` | Cloud Storage bucket | `connectpro-sessions` |

### **ElevenLabs Conversational AI Widget**

The app includes an interactive voice chat widget powered by ElevenLabs Conversational AI:

```html
<elevenlabs-convai agent-id="agent_0801kdppe0vjee8a7ypw4txexjnn"></elevenlabs-convai>
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
```

**To customize:**
1. Create your own agent at [ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai)
2. Configure the agent's personality, voice, and knowledge base
3. Replace `agent-id` in `index.html` with your agent ID

### **Voice Configuration**

#### ElevenLabs Settings (Primary)
- Model: `eleven_turbo_v2_5`
- Stability: `0.5`
- Similarity Boost: `0.75`

#### Google TTS Settings (Fallback)
- Voice: `en-US-Neural2-D` (deep male)
- Speaking Rate: `1.0`
- Pitch: `0.0`

---

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Login page |
| `/dashboard` | GET | Main application |
| `/generate-script` | POST | Generate AI script |
| `/coach-voice` | POST | ElevenLabs TTS |
| `/google-tts-fallback` | POST | Google TTS fallback |
| `/upload-recording` | POST | Save session to GCS |
| `/generate-audience-reaction` | POST | Audience sound effects |
| `/multimodal-assessment` | POST | AI coaching analysis |

---

## 🎨 UI Features

- **Glass morphism** design
- **Real-time word highlighting**
- **Animated metrics** (smooth transitions)
- **Responsive layout** (mobile-friendly)
- **Dark theme** optimized for focus
- **Coaching cues** (yellow highlights)
- **Interactive voice chat widget** (bottom-right corner)

---

## 🧪 Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Speech Recognition | ✅ | ⚠️ | ⚠️ | ✅ |
| Audio Recording | ✅ | ✅ | ✅ | ✅ |
| Voice Playback | ✅ | ✅ | ✅ | ✅ |
| Real-time Metrics | ✅ | ⚠️ | ⚠️ | ✅ |
| Voice Chat Widget | ✅ | ✅ | ✅ | ✅ |

**Note**: Full speech recognition support requires Chrome or Edge. Safari and Firefox have limited Web Speech API support. The ElevenLabs voice chat widget works across all modern browsers.

---

## 📈 Roadmap

- [ ] Video recording and analysis
- [ ] Presentation slide integration
- [ ] Team collaboration features
- [ ] Historical performance trends
- [ ] Custom coaching templates
- [ ] Mobile app (iOS/Android)
- [ ] WebRTC for live coaching sessions

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Cloud** for Vertex AI and infrastructure
- **ElevenLabs** for premium voice synthesis
- **Anthropic** for AI coaching insights
- **Tailwind CSS** for beautiful UI components

---

## 📞 Support

For issues, questions, or feature requests:
- 📧 Email: presentmeapp@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/Jerryblessed/connectpro/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Jerryblessed/connectpro/discussions)

---

## 🌟 Demo

**Live Demo**: [https://connectpro-79255818146.us-central1.run.app/](https://connectpro-79255818146.us-central1.run.app/)

**Video Demo**: [ https://www.youtube.com/watch?v=hBwUS_-vu7Y]( https://www.youtube.com/watch?v=hBwUS_-vu7Y) 
---

**Built with ❤️ by the ConnectPro Team**

*Empowering executives to communicate with confidence and impact.*
