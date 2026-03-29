import { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config/constants';
import { useAuth } from '../context/AuthContext';

const WELCOME = "Hello! I'm your FarmSathi assistant 🌾 I can help with crop advice, fertilizer tips, and disease info. Ask me anything!";

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
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setLoading(true);
    setMessages((prev) => [...prev, { sender: 'typing', text: 'Thinking…' }]);
    try {
      const fd = new FormData();
      fd.append('query', query);
      const res = await fetch(`${API_BASE_URL}/chatbot`, { method: 'POST', body: fd });
      const data = await res.json();
      const reply = data.response || data.message || 'Sorry, I could not process that.';
      setMessages((prev) => [...prev.filter((m) => m.sender !== 'typing'), { sender: 'bot', text: reply }]);
    } catch {
      setMessages((prev) => [...prev.filter((m) => m.sender !== 'typing'), { sender: 'bot', text: 'Sorry, the assistant is unavailable right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setOpen(!open)} title="Chat with FarmSathi">
        {open ? '✕' : '💬'}
      </button>
      {open && (
        <div className="chatbot-wrapper">
          <div className="chatbot-header">
            <span>🌾 FarmSathi Assistant</span>
            <button className="chatbot-close" type="button" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chatbot-body" ref={bodyRef} aria-live="polite">
            {messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
          </div>
          <form className="chatbot-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops, diseases…"
              disabled={loading}
              autoComplete="off"
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
