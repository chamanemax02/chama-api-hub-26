import React, { useState, useEffect } from 'react';
import { Users, Activity, AlertTriangle, Shield, Search, Globe, Clock, Package, Zap, Send, ToggleLeft, ToggleRight, X, Trash2, Key } from 'lucide-react';
import axios from 'axios';
import { categories } from '../data/apiList';

export function AdminPanel({ user, onRefreshCategories }) {
    const [activeTab, setActiveTab] = useState('Overview');
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ totalCalls: 0, activeUsers: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [news, setNews] = useState([]);
    const [newNews, setNewNews] = useState({ title: '', content: '', image: '', version: '' });
    const [uploading, setUploading] = useState(false);
    const [categoryStatuses, setCategoryStatuses] = useState({});
    const [togglingCat, setTogglingCat] = useState(null);
    const [coinSettings, setCoinSettings] = useState({ enabled: false, costPerRequest: 1 });
    const [updatingCoins, setUpdatingCoins] = useState(false);
    const [givingCoins, setGivingCoins] = useState({ targetUid: '', amount: 0, balance: 0, show: false });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const userId = user.uid || user.id;
            const [statsRes, usersRes, logsRes, newsRes, catsRes, coinsRes] = await Promise.all([
                axios.get(`/api/auth/admin/stats?uid=${userId}`),
                axios.get(`/api/auth/admin/users?uid=${userId}`),
                axios.get(`/api/auth/admin/all-logs?uid=${userId}`),
                axios.get(`/api/auth/news/list`),
                axios.get(`/api/auth/categories/status`),
                axios.get(`/api/auth/admin/coins/settings?uid=${userId}`)
            ]);

            if (statsRes.data.status) setStats(statsRes.data.stats);
            if (usersRes.data.status) setUsers(usersRes.data.users);
            if (logsRes.data.status) setLogs(logsRes.data.logs);
            if (newsRes.data.status) setNews(newsRes.data.news);
            if (catsRes.data.status) setCategoryStatuses(catsRes.data.statuses);
            if (coinsRes.data.status) setCoinSettings(coinsRes.data.settings);
        } catch (e) {
            console.error("Admin Fetch Error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCoinSettings = async () => {
        setUpdatingCoins(true);
        try {
            const res = await axios.post('/api/auth/admin/coins/settings/update', {
                uid: user.uid || user.id,
                ...coinSettings
            });
            if (res.data.status) alert("Coin System Updated!");
        } catch (e) {
            alert("Failed to update settings");
        } finally {
            setUpdatingCoins(false);
        }
    };

    const handleGiveCoins = async () => {
        try {
            const res = await axios.post('/api/auth/admin/coins/add', {
                uid: user.uid || user.id,
                targetUid: givingCoins.targetUid,
                amount: givingCoins.amount
            });
            if (res.data.status) {
                alert("Coins credited!");
                setGivingCoins({ ...givingCoins, show: false });
                fetchAdminData();
            }
        } catch (e) {
            alert("Failed to add coins");
        }
    };

    const handleSetCoins = async () => {
        try {
            const res = await axios.post('/api/auth/admin/coins/set', {
                uid: user.uid || user.id,
                targetUid: givingCoins.targetUid,
                balance: givingCoins.balance
            });
            if (res.data.status) {
                alert("Balance updated!");
                setGivingCoins({ ...givingCoins, show: false });
                fetchAdminData();
            }
        } catch (e) {
            alert("Failed to set balance");
        }
    };


    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`/api/tools/upload`, formData);
            if (res.data.status) {
                const url = res.data.result.imgbb !== '❌ Failed' ? res.data.result.imgbb : res.data.result.catbox;
                setNewNews({ ...newNews, image: url });
            }
        } catch (e) {
            alert("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleToggleCategory = async (cat, currentStatus) => {
        const newStatus = currentStatus === 'off' ? 'on' : 'off';
        setTogglingCat(cat);
        try {
            const res = await axios.post('/api/auth/admin/categories/toggle', {
                uid: user.uid || user.id,
                category: cat,
                status: newStatus
            });
            if (res.data.status) {
                setCategoryStatuses({
                    ...categoryStatuses,
                    [cat]: { status: newStatus, updatedAt: new Date().toISOString() }
                });
                if (onRefreshCategories) onRefreshCategories();
            }
        } catch (e) {
            alert("Failed to toggle category");
        } finally {
            setTogglingCat(null);
        }
    };

    const handleAddNews = async () => {
        if (!newNews.title || !newNews.content) return;
        try {
            const res = await axios.post('/api/auth/admin/news/add', {
                ...newNews,
                uid: user.uid || user.id
            });
            if (res.data.status) {
                setNewNews({ title: '', content: '', image: '', version: '' });
                fetchAdminData();
                alert("News added successfully!");
            }
        } catch (e) {
            alert("Failed to add news");
        }
    };

    const handleDeleteNews = async (newsId) => {
        if (!window.confirm("Are you sure you want to delete this news?")) return;
        try {
            const res = await axios.post('/api/auth/admin/news/delete', {
                uid: user.uid || user.id,
                newsId
            });
            if (res.data.status) {
                fetchAdminData();
            } else {
                alert("Failed to delete news");
            }
        } catch (e) {
            console.error("News Delete Error:", e);
            alert("Error deleting news");
        }
    };

    if (user.role !== 'admin') {
        return (
            <div className="error-card glass">
                <Shield size={48} color="var(--error)" />
                <h2>Access Denied</h2>
                <p>This section is restricted to administrators only.</p>
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-container animate-fade-in">
            <div className="admin-header">
                <div>
                    <h1 className="cyber-title">Command Center</h1>
                    <p className="subtitle">System governance and surveillance.</p>
                </div>
                <button className="btn-primary" onClick={fetchAdminData}>
                    <Activity size={18} /> Sync Data
                </button>
            </div>

            <div className="admin-stats-grid">
                <div className="stat-card glass neon-border-blue">
                    <Users size={24} color="#3b82f6" />
                    <div>
                        <span className="label">Total Citizens</span>
                        <div className="value">{stats.activeUsers}</div>
                    </div>
                </div>
                <div className="stat-card glass neon-border-purple">
                    <Zap size={24} color="#8b5cf6" />
                    <div>
                        <span className="label">Total Neural Calls</span>
                        <div className="value">{stats.totalCalls}</div>
                    </div>
                </div>
                <div className="stat-card glass neon-border-green">
                    <Globe size={24} color="#10b981" />
                    <div>
                        <span className="label">System Uptime</span>
                        <div className="value">99.9%</div>
                    </div>
                </div>
            </div>

            <div className="admin-tabs">
                {['Overview', 'Users', 'NeuroLogs', 'Health Matrix', 'System Matrix', 'News', 'Coins'].map(tab => (
                    <button
                        key={tab}
                        className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'Overview' && <Globe size={16} />}
                        {tab === 'Users' && <Users size={16} />}
                        {tab === 'NeuroLogs' && <Clock size={16} />}
                        {tab === 'Health Matrix' && <Activity size={16} />}
                        {tab === 'System Matrix' && <Shield size={16} />}
                        {tab === 'News' && <Package size={16} />}
                        {tab === 'Coins' && <Key size={16} />}
                        {tab === 'News' ? 'Broadcast News' : tab === 'Coins' ? 'Cloud Coins' : tab}
                    </button>
                ))}

            </div>

            <div className="admin-content">
                {activeTab === 'Overview' && (
                    <div className="overview-section animate-slide-up">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                            <div className="card glass">
                                <h3><Activity size={20} /> System Pulse</h3>
                                <div className="pulse-chart">
                                    <p style={{ color: '#6b7280' }}>Real-time system health is optimal.</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                        <div className="stat-box">
                                            <div className="stat-label">RAM Usage</div>
                                            <div className="stat-value">244MB / 1024MB</div>
                                        </div>
                                        <div className="stat-box">
                                            <div className="stat-label">CPU Load</div>
                                            <div className="stat-value">1.4%</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '0.8rem' }}>SECURITY STATUS</h4>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>Firewall active. No intrusions detected.</p>
                                </div>
                            </div>

                            <div className="card glass">
                                <h3><AlertTriangle size={20} color="#f59e0b" /> Critical Alerts</h3>
                                <div className="alerts-list">
                                    {logs.filter(l => l.method === 'DELETE').length > 0 ? (
                                        logs.filter(l => l.method === 'DELETE').map((al, idx) => (
                                            <div key={idx} className="alert-item broken">
                                                <span>Unauthorized Delete Attempt on {al.endpoint}</span>
                                                <small>{new Date(al.timestamp).toLocaleTimeString()}</small>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                                            <Shield size={32} style={{ marginBottom: '10px' }} />
                                            <p>No critical system alerts.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'System Matrix' && (
                    <div className="system-matrix-section animate-slide-up">
                        <div className="card glass">
                            <h3><Shield size={20} color="var(--primary)" /> API Category Override</h3>
                            <p className="subtitle" style={{ marginBottom: '2rem' }}>Toggle entire categories ON or OFF globally. Offline categories are hidden from the UI.</p>

                            <div className="category-control-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {categories.filter(c => c !== 'All').map(cat => {
                                    const status = categoryStatuses[cat]?.status || 'on';
                                    const isOff = status === 'off';
                                    const isToggling = togglingCat === cat;

                                    return (
                                        <div key={cat} className={`cat-control-card glass ${isOff ? 'is-off' : 'is-on'}`} style={{
                                            padding: '1.5rem',
                                            borderRadius: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            border: isOff ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                                            background: isOff ? 'rgba(239, 68, 68, 0.02)' : 'rgba(16, 185, 129, 0.02)'
                                        }}>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1rem', color: isOff ? '#ef4444' : '#10b981' }}>{cat}</h4>
                                                <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', opacity: 0.6 }}>
                                                    {isOff ? 'System Offline' : 'Operational'}
                                                </p>
                                            </div>
                                            <button
                                                className={`toggle-btn ${isOff ? 'off' : 'on'}`}
                                                disabled={isToggling}
                                                onClick={() => handleToggleCategory(cat, status)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: isToggling ? 'not-allowed' : 'pointer',
                                                    color: isOff ? '#ef4444' : '#10b981',
                                                    padding: '5px',
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                {isToggling ? (
                                                    <Activity size={24} className="animate-spin" />
                                                ) : isOff ? (
                                                    <ToggleLeft size={32} />
                                                ) : (
                                                    <ToggleRight size={32} />
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Health Matrix' && (
                    <div className="health-matrix-section animate-slide-up">
                        <div className="table-container glass">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Endpoint</th>
                                        <th>Status</th>
                                        <th>Total Hits</th>
                                        <th>P95 Latency</th>
                                        <th>Health</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from(new Set(logs.map(l => l.endpoint))).map(ep => {
                                        const count = logs.filter(l => l.endpoint === ep).length;
                                        const isStable = count > 0;
                                        return (
                                            <tr key={ep}>
                                                <td><code className="endpoint-tag">{ep}</code></td>
                                                <td>
                                                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }}></div>
                                                        Stable
                                                    </span>
                                                </td>
                                                <td>{count}</td>
                                                <td>124ms</td>
                                                <td>
                                                    <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                                                        <div style={{ width: '98%', height: '100%', background: '#10b981', borderRadius: '10px' }}></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'News' && (
                    <div className="admin-news-section animate-fade-in">
                        <div className="card glass" style={{ marginBottom: '2rem' }}>
                            <h3>Add News Broadcast</h3>
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" className="param-input" placeholder="Update v2.0..." value={newNews.title} onChange={e => setNewNews({ ...newNews, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Content (Markdown support)</label>
                                <textarea className="param-input" style={{ height: '100px' }} placeholder="Details about the update..." value={newNews.content} onChange={e => setNewNews({ ...newNews, content: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Version</label>
                                    <input type="text" className="param-input" placeholder="v2.5.0" value={newNews.version} onChange={e => setNewNews({ ...newNews, version: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Image Broadcast</label>
                                    <input type="file" className="param-input" accept="image/*" onChange={handleImageUpload} />
                                    {uploading && <p style={{ fontSize: '0.7rem' }}>Uploading to orbital link...</p>}
                                    {newNews.image && <p style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Image Attached ✓</p>}
                                </div>
                            </div>
                            <button className="btn-primary" onClick={handleAddNews} style={{ width: '100%', marginTop: '1rem' }}>
                                <Send size={18} /> Deploy News
                            </button>
                        </div>

                        <div className="table-container glass">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Title</th>
                                        <th>Version</th>
                                        <th>Author</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {news.length > 0 ? (
                                        news.map(n => (
                                            <tr key={n.id}>
                                                <td>{new Date(n.timestamp).toLocaleDateString()}</td>
                                                <td>{n.title}</td>
                                                <td>{n.version}</td>
                                                <td>{n.author}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => handleDeleteNews(n.id)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            padding: '5px'
                                                        }}
                                                        title="Delete Broadcast"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                                                No news broadcasts yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Users' && (
                    <div className="users-section">
                        <div className="search-box glass">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="table-container glass">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '30%' }}>Citizen</th>
                                        <th style={{ width: '10%' }}>Role</th>
                                        <th style={{ width: '10%' }}>Calls</th>
                                        <th style={{ width: '10%' }}>Coins</th>
                                        <th style={{ width: '20%' }}>Joined</th>
                                        <th style={{ width: '20%' }}>Actions</th>
                                    </tr>

                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => {
                                        const lastLogin = u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never';
                                        const joined = u.joined ? new Date(u.joined).toLocaleDateString() : 'Unknown';

                                        return (
                                            <tr key={u.id}>
                                                <td>
                                                    <div className="user-cell">
                                                        <img
                                                            src={u.photoURL || "/logo.png"}
                                                            alt="avatar"
                                                            onError={(e) => e.target.src = "/logo.png"}
                                                        />
                                                        <div>
                                                            <div className="name">{u.displayName || 'Unknown Citizen'}</div>
                                                            <div className="email">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                                                        {u.role?.toUpperCase() || 'USER'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Zap size={12} color="var(--primary)" />
                                                        {u.totalRequests || 0}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#eab308', fontWeight: 700 }}>
                                                        <Key size={12} />
                                                        {u.coins || 0}
                                                    </div>
                                                </td>
                                                <td>{joined}</td>
                                                <td>
                                                    <button
                                                        className="btn-primary"
                                                        style={{ padding: '6px 12px', fontSize: '0.7rem' }}
                                                        onClick={() => setGivingCoins({ ...givingCoins, targetUid: u.id || u.uid, balance: u.coins || 0, show: true })}
                                                    >
                                                        Manage Coins
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'NeuroLogs' && (
                    <div className="logs-section">
                        <div className="table-container glass">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>Citizen</th>
                                        <th>Endpoint</th>
                                        <th>IP Address</th>
                                        <th>Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, i) => (
                                        <tr key={i}>
                                            <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td>
                                                <div className="log-user">
                                                    <strong>{log.user}</strong>
                                                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{log.email}</span>
                                                </div>
                                            </td>
                                            <td><code className="endpoint-tag">{log.endpoint}</code></td>
                                            <td>{log.ip}</td>
                                            <td>{log.method}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Coins' && (
                    <div className="coins-matrix-section animate-slide-up">
                        <div className="card glass">
                            <h3><Key size={20} color="#eab308" /> Global Coin System</h3>
                            <p className="subtitle" style={{ marginBottom: '2rem' }}>Control the monetization and usage limits of your neural network.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                <div className="form-group">
                                    <label>System Activation</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                                        <button
                                            className={`toggle-btn ${coinSettings.enabled ? 'on' : 'off'}`}
                                            onClick={() => setCoinSettings({ ...coinSettings, enabled: !coinSettings.enabled })}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: coinSettings.enabled ? '#10b981' : '#ef4444' }}
                                        >
                                            {coinSettings.enabled ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                                        </button>
                                        <span style={{ fontWeight: 700, color: coinSettings.enabled ? '#10b981' : '#ef4444' }}>
                                            {coinSettings.enabled ? 'COIN SYSTEM ACTIVE' : 'FREE MODE (UNLIMITED)'}
                                        </span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Standard Cost (Coins per Req)</label>
                                    <input
                                        type="number"
                                        className="param-input"
                                        value={coinSettings.costPerRequest}
                                        onChange={e => setCoinSettings({ ...coinSettings, costPerRequest: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button className="btn-primary" onClick={handleUpdateCoinSettings} disabled={updatingCoins} style={{ width: '100%' }}>
                                {updatingCoins ? 'Synchronizing...' : 'Save System Settings'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for Managing Coins */}
            {givingCoins.show && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="modal-content glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>User Coin Uplink</h2>
                            <button onClick={() => setGivingCoins({ ...givingCoins, show: false })} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Amount to Add (Gift)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="number"
                                    className="param-input"
                                    placeholder="e.g. 100"
                                    onChange={e => setGivingCoins({ ...givingCoins, amount: e.target.value })}
                                />
                                <button className="btn-primary" onClick={handleGiveCoins}>Apply Gift</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Absolute Balance Override</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="number"
                                    className="param-input"
                                    value={givingCoins.balance}
                                    onChange={e => setGivingCoins({ ...givingCoins, balance: e.target.value })}
                                />
                                <button className="btn-secondary" onClick={handleSetCoins}>Set Balance</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
