// ConnectPro - Coach Marcus Edition
// Main Application JavaScript - COMPLETE FIXED VERSION

let rawText = "";
let sessionTranscript = "";
let sessionMistakes = new Set();
let score = 0;
let fillerCount = 0;
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let sessionId = Date.now().toString();
let coachIntro = "";
let currentAudio = null;
let recognition = null;
let recognitionTranscript = "";
let userToken = sessionStorage.getItem('userToken');

if (!userToken && window.location.pathname === "/dashboard") {
    window.location.href = "/";
}

if (userToken) {
    const payload = JSON.parse(atob(userToken.split('.')[1]));
    console.log("Session Active for: " + payload.name);
}

window.handleCredentialResponse = (response) => {
    sessionStorage.setItem('userToken', response.credential);
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("main-app").classList.remove("hidden");
    location.reload();
};

// SPEECH RECOGNITION INITIALIZATION
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        const langMap = {
            'English': 'en-US',
            'French': 'fr-FR',
            'German': 'de-DE',
            'Spanish': 'es-ES'
        };
        recognition.lang = langMap[document.getElementById('lang').value] || 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    recognitionTranscript += transcript + ' ';
                    detectFillers(transcript);
                    matchTranscript(transcript);
                } else {
                    interimTranscript += transcript;
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                console.log('No speech detected, continuing...');
            }
        };

        recognition.onend = () => {
            if (isRecording) {
                try {
                    recognition.start();
                } catch (e) {
                    console.log("Recognition restart suppressed");
                }
            }
        };
    } else {
        console.warn('Speech recognition not supported in this browser.');
        return null;
    }
    return recognition;
}

// FILLER DETECTION
function detectFillers(text) {
    const fillers = ['um', 'uh', 'ah', 'er', 'like', 'you know', 'so', 'basically'];
    const lowerText = text.toLowerCase();

    fillers.forEach(filler => {
        const regex = new RegExp('\\b' + filler + '\\b', 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            fillerCount += matches.length;
            document.getElementById('fillerCount').innerText = fillerCount;
        }
    });
}

// REAL-TIME TRANSCRIPT MATCHING
function matchTranscript(transcript) {
    const cleanScript = rawText.replace(/\[.*?\]/g, '').toLowerCase();
    const scriptWords = cleanScript.split(/\s+/).filter(w => w.length > 0);
    const transcriptWords = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    transcriptWords.forEach(word => {
        const cleanWord = word.replace(/[.,!?;:]/g, '');

        if (scriptWords.includes(cleanWord)) {
            const elements = document.querySelectorAll(`.word`);
            elements.forEach(el => {
                if (el.textContent.toLowerCase().replace(/[.,!?;:]/g, '') === cleanWord) {
                    el.classList.add('covered');
                }
            });
        } else {
            if (cleanWord.length > 3) {
                sessionMistakes.add(word);
                updateMistakeUI();
            }
        }
    });

    // Calculate accuracy
    const totalScriptLength = scriptWords.length;
    const coveredWordsCount = document.querySelectorAll('.word.covered').length;

    score = Math.round((coveredWordsCount / totalScriptLength) * 100);
    score = Math.min(100, Math.max(0, score));

    // Update UI
    document.getElementById('accBar').style.width = score + "%";
    document.getElementById('accLabel').innerText = score + "%";

    updateAudienceLevel(score);
}

// UPDATE MISTAKE UI
function updateMistakeUI() {
    const mistakeList = document.getElementById('mistakeList');
    const mistakeBadge = document.getElementById('mistakeBadge');

    mistakeBadge.innerText = sessionMistakes.size;

    mistakeList.innerHTML = "";
    sessionMistakes.forEach(mistake => {
        const div = document.createElement('div');
        div.className = "text-xs bg-red-500/10 text-red-400 px-3 py-2 rounded-lg";
        div.innerText = mistake;
        mistakeList.appendChild(div);
    });
}

// GENERATE SCRIPT
async function generate() {
    const btn = document.getElementById('genBtn');
    const display = document.getElementById('display');
    const topicInput = document.getElementById('topic');

    btn.innerText = "Coach Marcus is writing...";
    btn.disabled = true;
    display.innerText = "Generating your executive script...";

    // Reset metrics
    score = 0;
    fillerCount = 0;
    sessionMistakes.clear();
    document.getElementById('accBar').style.width = "0%";
    document.getElementById('accLabel').innerText = "0%";
    document.getElementById('fillerCount').innerText = "0";
    document.getElementById('mistakeBadge').innerText = "0";
    document.getElementById('mistakeList').innerHTML = "";

    try {
        const response = await fetch("/generate-script", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: topicInput.value || "Executive Leadership",
                mode: document.getElementById('mode').value,
                langName: document.getElementById('lang').value
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        rawText = data.script;
        coachIntro = data.coach_intro;

        renderUI();

        document.getElementById('micBtn').disabled = false;
        document.getElementById('speakerMain').disabled = false;
        document.getElementById('coachBtn').classList.remove('hidden');

        // Auto-play coach intro
        const voiceRes = await fetch("/coach-voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: coachIntro })
        });
        const voiceData = await voiceRes.json();
        if (voiceData.audio) {
            new Audio("data:audio/mp3;base64," + voiceData.audio).play();
        }

    } catch (error) {
        console.error("Session Error:", error);
        display.innerText = "Sir, I had trouble connecting to the Cloud. Please check your connection and try again.";
    } finally {
        btn.innerText = "Generate Script";
        btn.disabled = false;
    }
}

// RENDER UI
function renderUI() {
    const display = document.getElementById('display');
    display.innerHTML = "";

    if (document.getElementById('mode').value === "verbatim") {
        rawText.split(/(\s+|\[.*?\])/).forEach((token, i) => {
            if (token.startsWith("[")) {
                display.innerHTML += `<span class="cue-yellow">${token}</span>`;
            } else if (token.trim()) {
                const clean = token.toLowerCase().replace(/[.,!?;:]/g, "");
                display.innerHTML += `<span class="word" id="w-${i}-${clean}">${token}</span>`;
            } else {
                display.innerHTML += " ";
            }
        });
    } else {
        display.innerHTML = marked.parse(rawText);
    }
}

// PLAY COACH VOICE WITH FALLBACK
async function playCoachVoice() {
    const btn = document.getElementById('coachBtn');
    btn.disabled = true;
    btn.innerHTML = '⏳';

    try {
        const response = await fetch("/coach-voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: coachIntro })
        });

        const data = await response.json();

        if (data.audio) {
            if (currentAudio) currentAudio.pause();
            currentAudio = new Audio("data:audio/mpeg;base64," + data.audio);
            currentAudio.play();
            currentAudio.onended = () => {
                btn.disabled = false;
                btn.innerHTML = '🎙️';
            };
        } else {
            await playCoachWithGoogleTTS(coachIntro, btn);
        }
    } catch (error) {
        console.error("ElevenLabs error, using Google TTS fallback:", error);
        await playCoachWithGoogleTTS(coachIntro, btn);
    }
}

// GOOGLE TTS FALLBACK FOR COACH
async function playCoachWithGoogleTTS(text, btn) {
    try {
        const response = await fetch("/google-tts-fallback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        if (data.audio) {
            if (currentAudio) currentAudio.pause();
            currentAudio = new Audio("data:audio/mpeg;base64," + data.audio);
            currentAudio.play();
            currentAudio.onended = () => {
                btn.disabled = false;
                btn.innerHTML = '🎙️';
            };
        } else {
            throw new Error('Google TTS failed');
        }
    } catch (error) {
        console.error("Both TTS systems failed:", error);
        btn.disabled = false;
        btn.innerHTML = '🎙️';
    }
}

// PLAY SCRIPT WITH FALLBACK
async function playScript() {
    const btn = document.getElementById('speakerMain');
    btn.disabled = true;
    btn.innerHTML = '⏳';

    const cleanText = rawText.replace(/\[.*?\]/g, '');

    try {
        const response = await fetch("/coach-voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: cleanText })
        });

        const data = await response.json();

        if (data.audio) {
            if (currentAudio) currentAudio.pause();
            currentAudio = new Audio("data:audio/mpeg;base64," + data.audio);
            currentAudio.play();
            currentAudio.onended = () => {
                btn.disabled = false;
                btn.innerHTML = '🔊';
            };
            currentAudio.onerror = () => {
                btn.disabled = false;
                btn.innerHTML = '🔊';
                console.error('Audio playback error');
            };
        } else {
            await playWithGoogleTTS(cleanText, btn);
        }
    } catch (error) {
        console.error("ElevenLabs error, using Google TTS fallback:", error);
        await playWithGoogleTTS(cleanText, btn);
    }
}

// GOOGLE TTS FALLBACK FOR SCRIPT
async function playWithGoogleTTS(text, btn) {
    try {
        const response = await fetch("/google-tts-fallback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        if (data.audio) {
            if (currentAudio) currentAudio.pause();
            currentAudio = new Audio("data:audio/mpeg;base64," + data.audio);
            currentAudio.play();
            currentAudio.onended = () => {
                btn.disabled = false;
                btn.innerHTML = '🔊';
            };
        } else {
            throw new Error('Google TTS failed');
        }
    } catch (error) {
        console.error("Both TTS systems failed:", error);
        btn.disabled = false;
        btn.innerHTML = '🔊';
        alert('Voice synthesis temporarily unavailable. Please try again.');
    }
}

// RECORD BUTTON HANDLER
async function handleRecord() {
    if (isRecording) {
        stopRecording();
        return;
    }

    const btn = document.getElementById('micBtn');
    const label = document.getElementById('micLabel');
    btn.disabled = true;

    // Countdown
    for (let i = 3; i > 0; i--) {
        label.innerText = i;
        await new Promise(resolve => setTimeout(resolve, 800));
    }
    label.innerText = "GO!";
    btn.disabled = false;

    startRecording();
}

// START RECORDING
async function startRecording() {
    try {
        // Reset metrics
        score = 0;
        fillerCount = 0;
        recognitionTranscript = "";
        audioChunks = [];
        sessionMistakes.clear();

        document.getElementById('accBar').style.width = "0%";
        document.getElementById('accLabel').innerText = "0%";
        document.getElementById('fillerCount').innerText = "0";
        document.getElementById('mistakeBadge').innerText = "0";
        document.getElementById('mistakeList').innerHTML = "";

        // Remove all 'covered' classes from previous session
        document.querySelectorAll('.word.covered').forEach(el => {
            el.classList.remove('covered');
        });

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result;

                try {
                    const uploadResponse = await fetch("/upload-recording", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            audio: base64Audio,
                            session_id: sessionId
                        })
                    });
                    const uploadData = await uploadResponse.json();
                    console.log("Session saved to GCS:", uploadData.uri);
                } catch (error) {
                    console.error("GCS Upload Failed:", error);
                }
            };
        };

        mediaRecorder.start();
        isRecording = true;

        // Initialize and start recognition
        if (!recognition) initSpeechRecognition();
        if (recognition) {
            try {
                recognition.start();
                console.log("Speech recognition started successfully");
            } catch (e) {
                console.error("Could not start recognition:", e);
            }
        }

        // Update UI
        document.getElementById('micBtn').classList.add('mic-recording');
        document.getElementById('micLabel').innerText = "STOP";
        document.getElementById('micLabel').style.color = "white";
        document.getElementById('display').classList.remove('text-slate-700');
        document.getElementById('display').classList.add('text-slate-400');

    } catch (error) {
        console.error("Mic Access Error:", error);
        alert("Sir, I cannot access your microphone. Please check browser permissions.");
    }
}

// STOP RECORDING
function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());

        if (recognition) {
            recognition.stop();
        }

        isRecording = false;
        sessionTranscript = recognitionTranscript.trim();

        document.getElementById('micBtn').classList.remove('mic-recording');
        document.getElementById('micLabel').innerText = "RECORD";
        document.getElementById('micLabel').style.color = "";

        document.getElementById('finalBtn').classList.remove('hidden');
        document.getElementById('audienceBtn').classList.remove('hidden');
        document.getElementById('improvementStack').style.opacity = "1";

        console.log("Coaching session captured. Final score:", score);
    }
}

// UPDATE AUDIENCE LEVEL
function updateAudienceLevel(score) {
    const label = document.getElementById('audienceLevel');
    if (score >= 90) {
        label.innerText = "🔥 Captivated";
    } else if (score >= 75) {
        label.innerText = "👏 Engaged";
    } else if (score >= 60) {
        label.innerText = "👀 Attentive";
    } else {
        label.innerText = "😐 Waiting";
    }
}

// PLAY AUDIENCE REACTION
async function playAudienceReaction() {
    try {
        const response = await fetch("/generate-audience-reaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score })
        });

        const data = await response.json();

        if (data.audio) {
            if (currentAudio) currentAudio.pause();
            currentAudio = new Audio("data:audio/mpeg;base64," + data.audio);
            currentAudio.play();
        }

        if (data.message) {
            alert("Coach Marcus: " + data.message);
        }
    } catch (error) {
        console.error("Error playing audience reaction:", error);
    }
}

// RUN MULTIMODAL ASSESSMENT
async function runAssessment() {
    switchTab('assessment');
    const content = document.getElementById('assessmentContent');
    content.innerHTML = "<p class='animate-pulse text-purple-400'>🎯 Coach Marcus is reviewing your performance...</p>";

    try {
        const response = await fetch("/multimodal-assessment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mistakes: Array.from(sessionMistakes),
                score: score,
                fillers: fillerCount,
                transcript: sessionTranscript || "No transcript captured",
                session_id: sessionId
            })
        });

        const data = await response.json();

        if (data.error) {
            content.innerHTML = `<p class='text-red-400'>Error: ${data.error}</p>`;
            return;
        }

        content.innerHTML = marked.parse(data.feedback);

        document.getElementById('tabA').disabled = false;
        document.getElementById('tabA').classList.remove('opacity-20');

    } catch (error) {
        content.innerHTML = `<p class='text-red-400'>Error generating assessment: ${error.message}</p>`;
    }
}

// SWITCH TABS
function switchTab(type) {
    document.getElementById('viewS').classList.toggle('hidden', type === 'assessment');
    document.getElementById('viewA').classList.toggle('hidden', type === 'script');

    document.getElementById('tabS').className = type === 'script' ?
        "p-6 text-[10px] font-black uppercase tracking-widest border-b-2 border-blue-500 text-blue-500" :
        "p-6 text-[10px] font-black uppercase tracking-widest opacity-20";

    document.getElementById('tabA').className = type === 'assessment' ?
        "p-6 text-[10px] font-black uppercase tracking-widest border-b-2 border-blue-500 text-blue-500" :
        "p-6 text-[10px] font-black uppercase tracking-widest opacity-20";
}