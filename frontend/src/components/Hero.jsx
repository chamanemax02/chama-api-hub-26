import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Hero({ username }) {
    const navigate = useNavigate();

    return (
        <div className="hero-section animate-fade-in">
            <div className="hero-text">
                <div className="security-badge" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#4ade80',
                    padding: '6px 14px',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    width: 'fit-content',
                    marginBottom: '1rem',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 10px #4ade80' }}></span>
                    SUPER-SECURITY v2.0.1 ACTIVE
                </div>
                <h1>UNLIMITED<br />POWER.</h1>
                <p>Welcome, <strong>{username}</strong>. You have unrestricted access to all endpoints. No coins, no limits, just pure performance.</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn-primary" onClick={() => navigate('/endpoints')}>
                        Explore APIs <Sparkles size={18} />
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/chat')} style={{
                        background: 'rgba(217, 70, 239, 0.1)',
                        border: '1px solid rgba(217, 70, 239, 0.3)',
                        color: 'white',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontWeight: 600
                    }}>
                        Live Chat <MessageCircle size={18} />
                    </button>
                </div>
            </div>
            <div className="hero-image">
                <img src="/homelogo.jpg" alt="Hero" />
            </div>
        </div>
    );
}
