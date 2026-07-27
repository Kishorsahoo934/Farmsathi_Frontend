import { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config/constants';
import { useAuth } from '../context/AuthContext';

const WELCOME = "Hello! I'm your FarmSathi assistant 🌾 I can help with crop advice, fertilizer tips, and disease info. Ask me anything!";

const GREETINGS = {
  hi: "नमस्ते किसान भाई! मैं फार्मसाथी असिस्टेंट हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?",
  en: "Hello farmer friend! I am FarmSathi Assistant. How can I help you today?"
};

const SYSTEM_PROMPTS = {
  hi: "आप फार्मसाथी (FarmSathi) हैं - किसानों के सहायक AI असिस्टेंट। किसानों को फसलों, मौसम, कीट नियंत्रण और खाद के बारे में सरल हिंदी में 1-2 छोटे वाक्यों में स्पष्ट और उपयोगी सलाह दें।",
  en: "You are FarmSathi, an AI assistant for farmers. Provide concise 1-2 sentence advice regarding crops, weather, and agricultural care."
};

// Simple markdown → HTML for chatbot messages
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')   // **bold**
    .replace(/\*(.+?)\*/g, '<em>$1</em>')               // *italic*
    .replace(/^(\d+)\.\s+/gm, '<br/><b>$1.</b> ')       // numbered lists
    .replace(/^[-•]\s+/gm, '<br/>• ')                   // bullet points
    .replace(/\n/g, '<br/>');                            // line breaks
}

function ChatMessage({ msg }) {
  return (
    <div className={`chatbot-message chatbot-${msg.sender}`}>
      <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
    </div>
  );
}

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Voice Calling State
  const [isInCall, setIsInCall] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [status, setStatus] = useState("⚡ Ready");
  const [voices, setVoices] = useState([]);

  const bodyRef = useRef(null);
  const recognitionRef = useRef(null);
  const isSpeakingNowRef = useRef(false);
  const synthesisRef = useRef(window.speechSynthesis);
  const conversationHistoryRef = useRef([]);

  // Read API Key from environment variables
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_API_KEY || "";


  // Synchronized refs for event handlers to prevent stale closures
  const isInCallRef = useRef(isInCall);
  const currentLanguageRef = useRef(currentLanguage);

  useEffect(() => {
    isInCallRef.current = isInCall;
  }, [isInCall]);

  useEffect(() => {
    currentLanguageRef.current = currentLanguage;
  }, [currentLanguage]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Load available browser voices on start and when they change
  useEffect(() => {
    const loadVoices = () => {
      if (synthesisRef.current) {
        setVoices(synthesisRef.current.getVoices());
      }
    };

    loadVoices();
    if (synthesisRef.current) {
      synthesisRef.current.addEventListener('voiceschanged', loadVoices);
    }
    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.removeEventListener('voiceschanged', loadVoices);
      }
    };
  }, []);

  // End voice call if widget is closed
  useEffect(() => {
    if (!open && isInCall) {
      endCall();
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  // Get the best matches for Hindi or English
  const getBestVoice = (lang) => {
    if (voices.length === 0) return null;

    if (lang === 'hi') {
      const hiVoices = voices.filter(v => v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      if (hiVoices.length > 0) {
        const rankedHi = hiVoices.sort((a, b) => {
          const getRank = (v) => {
            const name = v.name.toLowerCase();
            if (name.includes('natural') || name.includes('online')) return 5;
            if (name.includes('google')) return 4;
            if (name.includes('microsoft')) return 3;
            if (name.includes('lekha')) return 2;
            if (v.localService === false) return 1;
            return 0;
          };
          return getRank(b) - getRank(a);
        });
        return rankedHi[0];
      }
      return voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang.startsWith('en')) || voices[0];
    } else {
      const enInVoice = voices.find(v => v.lang === 'en-IN');
      if (enInVoice) return enInVoice;
      const enVoice = voices.find(v => v.lang.startsWith('en'));
      if (enVoice) return enVoice;
      return voices[0];
    }
  };

  const playBrowserSynth = (text, lang, voice, resolve) => {
    const synth = synthesisRef.current;
    if (!synth) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-IN';

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    synth.speak(utterance);
  };

  // Speak helper with high-quality fallback for Hindi
  const speakText = (text, lang) => {
    return new Promise((resolve) => {
      const synth = synthesisRef.current;
      if (!synth) {
        resolve();
        return;
      }
      synth.cancel();

      // Strip markdown tags before speaking
      const plainText = text.replace(/[*_#`~]/g, '').trim();

      const matchedVoice = getBestVoice(lang);
      const isNativeHindi = matchedVoice && (matchedVoice.lang.startsWith('hi') || matchedVoice.name.toLowerCase().includes('hindi'));
      const isPremiumVoice = matchedVoice && (matchedVoice.name.toLowerCase().includes('online') || matchedVoice.name.toLowerCase().includes('natural') || matchedVoice.name.toLowerCase().includes('google'));

      if (lang === 'hi' && (!isNativeHindi || !isPremiumVoice) && plainText.length < 200) {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${encodeURIComponent(plainText)}`;
        const audio = new Audio(url);
        audio.onended = () => resolve();
        audio.onerror = () => {
          playBrowserSynth(plainText, lang, matchedVoice, resolve);
        };
        audio.play().catch(() => {
          playBrowserSynth(plainText, lang, matchedVoice, resolve);
        });
        return;
      }

      playBrowserSynth(plainText, lang, matchedVoice, resolve);
    });
  };

  // Recognition initialization
  const initRecognition = (lang) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return null;
    }
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognitionAPI();
    recog.continuous = false;
    recog.interimResults = false;

    if (lang === "hi") recog.lang = "hi-IN";
    else recog.lang = "en-IN";

    recog.onstart = () => {
      if (!isInCallRef.current) return;
      setStatus(lang === 'hi' ? "🎧 सुन रहा हूँ..." : "🎧 Listening...");
    };

    recog.onresult = async (event) => {
      if (!isInCallRef.current) return;
      const text = event.results[0][0].transcript;
      sendMessage(null, text);
    };

    recog.onerror = () => {
      if (isInCallRef.current && !isSpeakingNowRef.current) {
        setTimeout(() => {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          } catch (e) {}
        }, 500);
      }
    };

    recog.onend = () => {
      if (isInCallRef.current && !isSpeakingNowRef.current) {
        setTimeout(() => {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          } catch (e) {}
        }, 300);
      }
    };

    return recog;
  };

  // Trigger greeting
  const triggerGreeting = (lang) => {
    const greetingMsg = GREETINGS[lang] || GREETINGS.en;
    setMessages((prev) => [...prev, { sender: 'bot', text: greetingMsg }]);

    isSpeakingNowRef.current = true;
    setStatus(lang === 'hi' ? "🗣️ बोल रहा हूँ..." : "🗣️ Speaking...");

    speakText(greetingMsg, lang).then(() => {
      isSpeakingNowRef.current = false;
      if (isInCallRef.current) {
        setStatus(lang === 'hi' ? "🎧 सुन रहा हूँ..." : "🎧 Listening...");

        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (e) {}
        }
        const recog = initRecognition(lang);
        recognitionRef.current = recog;
        if (recog) {
          try {
            recog.start();
          } catch (e) {}
        }
      }
    });
  };

  // Start Call
  const startCall = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const recog = initRecognition(currentLanguage);
    if (!recog) {
      alert("Voice recognition not supported on this browser. Try Chrome.");
      return;
    }
    recognitionRef.current = recog;

    conversationHistoryRef.current = [{ role: "system", content: SYSTEM_PROMPTS[currentLanguage] }];
    setIsInCall(true);
    triggerGreeting(currentLanguage);
  };

  // End Call
  const endCall = () => {
    setIsInCall(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    isSpeakingNowRef.current = false;
    setStatus("⚡ Ready");
    setMessages((prev) => [
      ...prev,
      { sender: 'bot', text: currentLanguage === 'hi' ? "📴 कॉल समाप्त।" : "📴 Call ended." }
    ]);
  };

  // Toggle Voice Call
  const toggleVoiceCall = () => {
    if (isInCall) {
      endCall();
    } else {
      startCall();
    }
  };

  // Set Language
  const handleSetLanguage = (lang) => {
    setCurrentLanguage(lang);
    if (isInCallRef.current) {
      conversationHistoryRef.current = [{ role: "system", content: SYSTEM_PROMPTS[lang] }];
      // If already in call, switch language and trigger greeting
      triggerGreeting(lang);
    }
  };

  const sendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const query = (textOverride || input).trim();
    if (!query || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setLoading(true);
    setMessages((prev) => [...prev, { sender: 'typing', text: 'Thinking…' }]);

    const isCallActive = isInCallRef.current;

    // VERY IMPORTANT: Prevent loop by setting speaking state immediately to prevent recognition auto-restart
    if (isCallActive) {
      isSpeakingNowRef.current = true;
      setStatus(currentLanguageRef.current === 'hi' ? "🤔 सोच रहा हूँ..." : "🤔 Thinking...");
    }

    // Pause recognition while processing API call
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      if (isCallActive) {
        // Voice Calling mode: call Groq API directly from the frontend
        conversationHistoryRef.current.push({ role: "user", content: query });

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + API_KEY
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: conversationHistoryRef.current,
            max_tokens: 120,
            temperature: 0.6
          })
        });

        if (!res.ok) throw new Error("API Request Failed");
        const data = await res.json();
        const reply = data.choices[0].message.content.replace(/[*_#`~]/g, '').trim();

        conversationHistoryRef.current.push({ role: "assistant", content: reply });
        setMessages((prev) => [...prev.filter((m) => m.sender !== 'typing'), { sender: 'bot', text: reply }]);

        // Speak the response
        setStatus(currentLanguageRef.current === 'hi' ? "🗣️ बोल रहा हूँ..." : "🗣️ Speaking...");
        await speakText(reply, currentLanguageRef.current);

        isSpeakingNowRef.current = false;

        // Resume listening
        if (isInCallRef.current) {
          setStatus(currentLanguageRef.current === 'hi' ? "🎧 सुन रहा हूँ..." : "🎧 Listening...");
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
        }
      } else {
        // Standard text mode: call backend as before
        const fd = new FormData();
        fd.append('query', query);
        const res = await fetch(`${API_BASE_URL}/chatbot`, { method: 'POST', body: fd });
        const data = await res.json();
        const reply = data.response || data.message || 'Sorry, I could not process that.';

        setMessages((prev) => [...prev.filter((m) => m.sender !== 'typing'), { sender: 'bot', text: reply }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev.filter((m) => m.sender !== 'typing'), { sender: 'bot', text: 'Sorry, the assistant is unavailable right now.' }]);
      if (isCallActive) {
        const errorMsg = currentLanguageRef.current === 'hi' ? "क्षमा करें, कनेक्शन में समस्या है।" : "Sorry, there is a connection issue.";
        await speakText(errorMsg, currentLanguageRef.current);
        isSpeakingNowRef.current = false;
        if (isInCallRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Icon mapping for current status
  const getStatusIndicatorClass = () => {
    if (status.includes("Listening") || status.includes("सुन")) return "listening";
    if (status.includes("Speaking") || status.includes("बोल")) return "speaking";
    if (status.includes("Thinking") || status.includes("सोच")) return "thinking";
    return "";
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setOpen(!open)} title="Chat with FarmSathi">
        {open ? '✕' : '💬'}
      </button>
      {open && (
        <div className="chatbot-wrapper">
          <div className="chatbot-header">
            <span>🌾 FarmSathi Assistant</span>
            <div className="chatbot-header-actions">
              <button
                className={`lang-toggle-btn ${currentLanguage === 'hi' ? 'active' : ''}`}
                type="button"
                onClick={() => handleSetLanguage('hi')}
                title="Hindi language"
              >
                हि
              </button>
              <button
                className={`lang-toggle-btn ${currentLanguage === 'en' ? 'active' : ''}`}
                type="button"
                onClick={() => handleSetLanguage('en')}
                title="English language"
              >
                EN
              </button>
            </div>
            <button className="chatbot-close" type="button" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Voice Calling Status Bar */}
          {isInCall && (
            <div className="chatbot-status-bar">
              <span className="chatbot-status-text">
                <span className={`chatbot-status-indicator ${getStatusIndicatorClass()}`} />
                {status}
              </span>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Voice Mode</span>
            </div>
          )}

          <div className="chatbot-body" ref={bodyRef} aria-live="polite">
            {messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
          </div>
          <form className="chatbot-form" onSubmit={sendMessage}>
            <div className="chatbot-input-container">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isInCall ? (status.includes("Listening") || status.includes("सुन") ? "Listening..." : status) : "Ask about crops, diseases…"}
                disabled={loading}
                autoComplete="off"
              />
              <button
                type="button"
                className={`chatbot-voice-btn ${isInCall ? 'active' : ''}`}
                onClick={toggleVoiceCall}
                title="Toggle Voice Assistant"
              >
                {isInCall ? '🔴' : '🎙️'}
              </button>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
