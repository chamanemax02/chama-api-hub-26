import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle, Loader2, Trash2, Edit2, Check, X as CloseIcon } from 'lucide-react';
import axios from 'axios';

export function LiveChat({ user }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [editingMsg, setEditingMsg] = useState(null);
    const [editText, setEditText] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Polling every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get('/api/chat/list');
            if (res.data.status) {
                setMessages(res.data.messages);
            }
        } catch (e) {
            console.error("Chat fetch error:", e);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            const res = await axios.post('/api/chat/delete', {
                messageId,
                uid: user.uid || user.id
            });
            if (res.data.status) fetchMessages();
        } catch (e) {
            console.error("Delete error:", e);
        }
    };

    const handleEditMessage = async (e) => {
        e.preventDefault();
        if (!editText.trim()) return;
        try {
            const res = await axios.post('/api/chat/edit', {
                messageId: editingMsg,
                uid: user.uid || user.id,
                text: editText
            });
            if (res.data.status) {
                setEditingMsg(null);
                setEditText('');
                fetchMessages();
            }
        } catch (e) {
            console.error("Edit error:", e);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const userId = user?.uid || user?.id;
        if (!newMessage.trim() || sending) return;
        if (!userId) {
            alert("Matrix Connection Lost: Please refresh or login again.");
            return;
        }

        setSending(true);
        try {
            const res = await axios.post('/api/chat/send', {
                uid: userId,
                text: newMessage
            });
            if (res.data.status) {
                setNewMessage('');
                fetchMessages();
            } else {
                alert("Matrix Sync Error: " + (res.data.error || "Unknown"));
            }
        } catch (e) {
            console.error("Chat send error:", e);
            alert("Broadcast Failed: Check your network connection.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="chat-container glass animate-fade-in">
            <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="chat-status-dot"></div>
                    <h3 style={{ margin: 0, color: 'white' }}>Global Live Chat</h3>
                </div>
                <div className="chat-subtitle">Connected as {user.displayName}</div>
            </div>

            <div className="chat-messages" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <MessageCircle size={48} opacity={0.2} />
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={msg.id || idx} className={`message-wrapper ${msg.uid === (user.uid || user.id) ? 'own' : ''}`}>
                            <img src={msg.photoURL || "/logo.png"} className="msg-avatar" alt="" />
                            <div className="message-content">
                                <div className="msg-info">
                                    <span className="msg-user">{msg.user}</span>
                                    {msg.role === 'admin' && <span className="admin-badge">ADMIN</span>}
                                    <span className="msg-time">
                                        {msg.edited && <span style={{ opacity: 0.5, fontSize: '0.6rem', marginRight: '5px' }}>(edited)</span>}
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>

                                    <div className="msg-actions">
                                        {msg.uid === (user.uid || user.id) && (
                                            <button className="action-btn edit" onClick={() => {
                                                setEditingMsg(msg.id);
                                                setEditText(msg.text);
                                            }}>
                                                <Edit2 size={12} />
                                            </button>
                                        )}
                                        {(user.role === 'admin' || msg.uid === (user.uid || user.id)) && (
                                            <button className="action-btn delete" onClick={() => handleDeleteMessage(msg.id)}>
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {editingMsg === msg.id ? (
                                    <div className="edit-area">
                                        <input
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleEditMessage(e)}
                                            className="edit-input"
                                            autoFocus
                                        />
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button className="edit-confirm" onClick={handleEditMessage}><Check size={14} /></button>
                                            <button className="edit-cancel" onClick={() => setEditingMsg(null)}><CloseIcon size={14} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="msg-text">{msg.text}</div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                />
                <button type="submit" disabled={sending || !newMessage.trim()}>
                    {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
            </form>
        </div>
    );
}

