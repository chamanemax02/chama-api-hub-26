import React, { useState, useEffect } from 'react';
import { User, Shield, Battery, Key, List, RefreshCw, Check, Copy, AlertCircle, Save } from 'lucide-react';
import axios from 'axios';

export function Profile({ user, setUser }) {
    const [activeSection, setActiveSection] = useState('profile');
    const [copied, setCopied] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [globalStats, setGlobalStats] = useState({ totalCalls: 0, activeUsers: 0 });
    const [battery, setBattery] = useState({ level: 100, charging: false });
    const [ip, setIp] = useState('Loading...');

    useEffect(() => {
        // Fetch User Data from Backend
        fetchUserData();
        fetchGlobalStats();

        // Battery Stats
        if ('getBattery' in navigator) {
            navigator.getBattery().then(bat => {
                setBattery({ level: Math.round(bat.level * 100), charging: bat.charging });
                bat.addEventListener('levelchange', () => setBattery(b => ({ ...b, level: Math.round(bat.level * 100) })));
                bat.addEventListener('chargingchange', () => setBattery(b => ({ ...b, charging: bat.charging })));
            });
        }

        // IP Address
        axios.get('https://api.ipify.org?format=json').then(res => setIp(res.data.ip)).catch(() => setIp('Unable to fetch'));
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await axios.get(`/api/auth/user-data?uid=${user.uid}`);
            if (res.data.status) {
                setUser(res.data.user);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchGlobalStats = async () => {
        try {
            const res = await axios.get('/api/auth/admin/stats');
            if (res.data.status) setGlobalStats(res.data.stats);
        } catch (e) { }
    };

    const regenerateKey = async () => {
        if (!window.confirm("Regenerate your API Key? Old key will stop working.")) return;
        try {
            const res = await axios.post('/api/auth/regen-key', { uid: user.uid });
            if (res.data.status) {
                setUser({ ...user, apikey: res.data.apikey });
                alert("New API Key generated!");
            }
        } catch (e) {
            alert("Failed to regenerate key");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sections = [
        { id: 'profile', label: 'Profile', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'apikey', label: 'API Key', icon: <Key size={18} /> },
        { id: 'logs', label: 'Request Logs', icon: <List size={18} /> }
    ];

    if (user.role === 'admin') {
        sections.push({ id: 'admin', label: 'Admin Panel', icon: <Shield size={18} color="var(--primary)" /> });
    }

    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (user.role === 'admin' && activeSection === 'admin') {
            axios.get('/api/auth/admin/alerts').then(res => {
                if (res.data.status) setAlerts(res.data.alerts);
            });
        }
    }, [activeSection, user.role]);

    return (
        <div className="profile-container animate-fade-in" style={{ padding: '0 1rem' }}>
            {/* Top Stats Bar */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box"><RefreshCw size={24} color="#d946ef" /></div>
                        <div>
                            <p className="stat-label">GLOBAL API CALLS</p>
                            <h3 className="stat-value">{(globalStats.totalCalls || 0).toLocaleString()}</h3>
                        </div>
                    </div>
                    <p className="stat-footer" style={{ color: '#10b981' }}>↑ Aggregated Hub Traffic</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box" style={{ background: 'rgba(234, 179, 8, 0.1)' }}><Key size={24} color="#eab308" /></div>
                        <div>
                            <p className="stat-label">YOUR COINS</p>
                            <h3 className="stat-value">{(user.coins || 0).toLocaleString()}</h3>
                        </div>
                    </div>
                    <p className="stat-footer" style={{ color: '#eab308' }}>Available API Credits</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-box"><Battery size={24} color="#10b981" /></div>
                        <div>
                            <p className="stat-label">BATTERY STATUS</p>
                            <h3 className="stat-value">{battery.level}%</h3>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                        <div style={{
                            width: '100%',
                            height: '14px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{
                                width: `${battery.level}%`,
                                height: '100%',
                                background: battery.level > 20 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f87171)',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>
                    <p className="stat-footer">{battery.charging ? 'Currently Charging' : 'Device Unplugged'}</p>
                </div>
            </div>

            {/* Profile Content Area */}
            <div style={{
                background: 'rgba(30, 32, 50, 0.4)',
                backdropFilter: 'blur(30px)',
                borderRadius: '35px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden'
            }}>
                {/* Navigation Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    padding: '0 2rem',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    {sections.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '1.5rem 2rem',
                                border: 'none',
                                background: 'none',
                                color: activeSection === s.id ? 'var(--primary)' : '#9ca3af',
                                borderBottom: activeSection === s.id ? '2px solid var(--primary)' : '2px solid transparent',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            {s.icon} {s.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: '2.5rem' }}>
                    {activeSection === 'profile' && (
                        <div className="animate-slide-up">
                            <h2 style={{ color: 'white', marginBottom: '2rem' }}>Update Profile</h2>
                            <div className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div className="field-group">
                                    <label>Display Name</label>
                                    <input type="text" className="param-input" defaultValue={user.displayName} />
                                </div>
                                <div className="field-group">
                                    <label>Email Address</label>
                                    <input type="text" className="param-input" defaultValue={user.email} readOnly style={{ opacity: 0.6 }} />
                                </div>
                                <div className="field-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Profile Picture URL</label>
                                    <input type="text" className="param-input" defaultValue={user.photoURL} readOnly style={{ opacity: 0.6 }} />
                                </div>
                            </div>
                            <button className="btn-primary" style={{ marginTop: '2rem' }}>
                                <Save size={20} /> Update Profile
                            </button>
                        </div>
                    )}

                    {activeSection === 'apikey' && (
                        <div className="animate-slide-up">
                            <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>API Key Management</h2>
                            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Your personal key to access all endpoints. Keep it secret.</p>

                            <div className="field-group">
                                <label>Your Private API Key</label>
                                <div className="input-with-copy">
                                    <input type="text" readOnly value={user.apikey} />
                                    <button onClick={() => copyToClipboard(user.apikey)}>
                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button className="btn-secondary" onClick={regenerateKey}>
                                    <RefreshCw size={20} /> Regenerate API Key
                                </button>
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '15px' }}>
                                <p style={{ color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} /> Warning: Regenerating your key will immediately invalidate your current key in all your applications.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'logs' && (
                        <div className="animate-slide-up">
                            <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Request Logs</h2>
                            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <th style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>TIMESTAMP</th>
                                            <th style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>METHOD</th>
                                            <th style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>ENDPOINT</th>
                                            <th style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>IP ADDRESS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(user.logs || []).map((log, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '1rem', color: '#e5e7eb', fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        background: log.method === 'POST' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                        color: log.method === 'POST' ? '#a78bfa' : '#34d399',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700
                                                    }}>{log.method}</span>
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--primary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{log.endpoint}</td>
                                                <td style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.85rem' }}>{log.ip}</td>
                                            </tr>
                                        ))}
                                        {(!user.logs || user.logs.length === 0) && (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>No requests recorded yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSection === 'admin' && (
                        <div className="animate-slide-up">
                            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Admin Control Center</h2>
                            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Monitoring system health and broken endpoints.</p>

                            <div className="alerts-container">
                                <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '1px' }}>BROKEN APIS / SYSTEM ERRORS</h3>

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {alerts.map((alert, idx) => (
                                        <div key={idx} style={{
                                            background: 'rgba(239, 68, 68, 0.05)',
                                            border: '1px solid rgba(239, 68, 68, 0.1)',
                                            borderRadius: '15px',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.8rem' }}>{alert.type}</span>
                                                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{new Date(alert.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p style={{ color: 'white', fontWeight: 600, fontSize: '1rem', margin: '5px 0' }}>{alert.endpoint}</p>
                                            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Error: <span style={{ color: '#fca5a5' }}>{alert.error}</span></p>
                                            <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>Triggered by: {alert.user}</p>
                                        </div>
                                    ))}
                                    {alerts.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: '#4b5563', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                                            All systems operational. No broken APIs reported.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
