import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, MessageSquare, Loader2, X, RefreshCw } from 'lucide-react';
import axios from 'axios';

export function SupportChat({ onClose, user }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I am Chama Support AI. I'm here to help you get the most out of Chama Hub. How can I assist you?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const systemPrompt = `You are Chama Support AI, the official assistant for Chama API Hub.
Chama Hub is a powerful API ecosystem created by 'Chama Ofc'.
Features:
- Movies & TV: v2 Ultra system with Sonic Cloud, Srihub, Baiscope, PirateLK, moviesub, subslk, dinka.
- AI Tools: ChatGPT Ultra (Direct access), Gemini Pro, Image Generation (Flux, Gemini, Grok, Crictos), Background Removal, Brat Stickers.
- Social Media: Expert downloads for Facebook (multiple providers), Instagram (SnapInsta, VideoDropper), Twitter, Spotify, YouTube.
- Support: Global Live Chat, User Profile, Admin Panel for category management.
Always be helpful, professional, and explain how to use the hub. If asked about technical issues, suggest checking the 'Endpoints' status.`;

            console.log("Support AI: Sending request to matrix...");
            const res = await axios.get(`/api/ai/matrix-support?prompt=${encodeURIComponent(userMsg)}&system=${encodeURIComponent(systemPrompt)}`);

            console.log("Support AI: Response received", res.data);
            if (res.data && (res.data.result || res.data.success)) {
                setMessages(prev => [...prev, { role: 'assistant', text: res.data.result }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', text: "Chama Hub returned an empty signal. Please rephrase your query." }]);
            }
        } catch (error) {
            console.error("Support AI Connection error:", error.response?.data || error.message);
            setMessages(prev => [...prev, { role: 'assistant', text: `Signal lost: ${error.response?.data?.error || "Connection Timeout"}. Please try standard ChatGPT.` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="support-ai-overlay">
            <div className="support-ai-card glass animate-slide-up">
                <div className="support-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="ai-status-pulse">
                            <Bot size={20} color="var(--primary)" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>Chama Support AI</h3>
                            <span style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 800 }}>ONLINE</span>
                        </div>
                    </div>
                    <button className="close-support" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="support-messages" ref={scrollRef}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`support-msg-wrapper ${msg.role}`}>
                            <div className="msg-bubble">
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="support-msg-wrapper assistant">
                            <div className="msg-bubble loading">
                                <Loader2 className="animate-spin" size={16} />
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                <form className="support-input-form" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Ask about Chama Hub..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" disabled={!input.trim() || loading}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
