import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Send, Loader2, Download, Film, Shield } from 'lucide-react';
import axios from 'axios';

const API_BASE = ""; // Relative path for same-origin or configured proxy
export function APIModal({ selectedApi, onClose, user }) {
    const [params, setParams] = useState({});
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [testStyle, setTestStyle] = useState('glitch');

    useEffect(() => {
        if (selectedApi) {
            const initialParams = {};
            selectedApi.params.forEach(p => {
                initialParams[p.name] = p.default || '';
            });
            setParams(initialParams);
            setResponse(null);
        }
    }, [selectedApi]);

    const handleTest = async () => {
        setLoading(true);
        setResponse(null);
        try {
            let endpoint = selectedApi.endpoint;
            if (selectedApi.styleParam) {
                endpoint += `/${testStyle}`;
            }

            const queryParams = new URLSearchParams();
            queryParams.append('apikey', user?.apikey || "chama_mini_api");
            Object.keys(params).forEach(key => {
                queryParams.append(key, params[key]);
            });
            // Cache busting
            queryParams.append('_t', Date.now());

            const url = `${API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryParams.toString()}`;

            if (selectedApi.responseType === 'image') {
                const res = await axios.get(url, { responseType: 'blob' });
                const imageUrl = URL.createObjectURL(res.data);
                setResponse({ status: true, type: 'image', url: imageUrl });
            } else {
                const res = await axios.get(url);
                setResponse(res.data);
            }
        } catch (error) {
            setResponse({ status: false, error: error.message, details: error.response?.data });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const generateUrlForCopy = () => {
        const origin = window.location.origin;
        let url = `${origin}${API_BASE}${selectedApi.endpoint}`;
        if (selectedApi.styleParam) {
            url += `/${testStyle}`;
        }
        const queryParams = new URLSearchParams();
        queryParams.append('apikey', user?.apikey || "chama_mini_api");
        selectedApi.params.forEach(p => {
            queryParams.append(p.name, params[p.name] || p.default || 'VALUE');
        });
        return `${url}${url.includes('?') ? '&' : '?'}${queryParams.toString()}`;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <img src={selectedApi.icon} style={{ width: 44, height: 44, borderRadius: '12px' }} alt="icon" />
                        <div>
                            <h3 style={{ color: 'white', margin: 0 }}>{selectedApi.name}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{selectedApi.endpoint}</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {selectedApi.status === 'broken' && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        margin: '0 1.5rem 1.5rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#ef4444'
                    }}>
                        <Shield size={20} />
                        <div>
                            <strong style={{ display: 'block', fontSize: '0.85rem' }}>ENDPOINT UNSTABLE</strong>
                            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>This API is currently under maintenance or broken. Requests may fail.</span>
                        </div>
                    </div>
                )}

                <div className="modal-body">
                    <div className="field-group">
                        <label>Executable Call URL</label>
                        <div className="input-with-copy">
                            <input
                                type="text"
                                readOnly
                                value={user?.apikey ? generateUrlForCopy() : 'Login to view your personal key'}
                                style={{ fontSize: '0.85rem', color: user?.apikey ? 'white' : '#6b7280' }}
                            />
                            {user?.apikey && (
                                <button onClick={() => copyToClipboard(generateUrlForCopy())}>
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Full URL with your master key and parameters.</p>
                    </div>

                    {selectedApi.styles && (
                        <div className="field-group">
                            <label>Select Style</label>
                            <select
                                className="param-input"
                                value={testStyle}
                                onChange={(e) => setTestStyle(e.target.value)}
                                style={{ cursor: 'pointer', appearance: 'none' }}
                            >
                                {selectedApi.styles.map(s => (
                                    <option key={s} value={s} style={{ background: '#0d0e1a' }}>{s.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedApi.params.map(param => (
                        <div className="field-group" key={param.name}>
                            <label>{param.label}</label>
                            <input
                                type="text"
                                className="param-input"
                                placeholder={`Enter ${param.label || param.name}...`}
                                value={params[param.name] || ''}
                                onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
                            />
                        </div>
                    ))}

                    <button className={`btn-send ${loading ? 'loading loading-pulse' : ''}`} onClick={handleTest} disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                        <span>{loading ? 'Processing Request...' : 'Run Live Request'}</span>
                    </button>

                    {response && (
                        <div className="animate-fade-in" style={{ marginTop: '1.5rem' }}>
                            {/* Premium Movie Download UI */}
                            {response.status && response.data && (response.data.download || response.data.links) && (
                                <div className="movie-dl-card">
                                    <div className="movie-dl-header">
                                        <div className="movie-icon-box">
                                            <Film size={32} color="var(--primary)" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 className="movie-title">{response.data.title || selectedApi.name}</h4>
                                            <div className="movie-meta">
                                                {response.data.size && <span className="meta-tag size">{response.data.size}</span>}
                                                {response.data.quality && <span className="meta-tag quality">{response.data.quality}</span>}
                                                <span className="meta-tag status">READY FOR DOWNLOAD</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dl-buttons-grid">
                                        {(response.data.download || response.data.links || []).map((link, idx) => {
                                            const name = (link.name || link.title || "").toLowerCase();
                                            let btnClass = "dl-btn-generic";
                                            if (name.includes('direct')) btnClass = "dl-btn-direct";
                                            if (name.includes('google') || name.includes('gdrive')) btnClass = "dl-btn-google";
                                            if (name.includes('telegram')) btnClass = "dl-btn-telegram";

                                            return (
                                                <a
                                                    key={idx}
                                                    href={link.url || link.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`dl-action-btn ${btnClass}`}
                                                >
                                                    <Download size={18} />
                                                    <span>{link.name || link.title || "Download Link"}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Generic Search Results UI (APK, Search, etc.) */}
                            {response.status && Array.isArray(response.result) && response.result.length > 0 && (
                                <div className="search-results-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr',
                                    gap: '12px',
                                    marginTop: '1rem',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    paddingRight: '5px'
                                }}>
                                    {response.result.map((item, idx) => (
                                        <div key={idx} className="search-result-item glass" style={{
                                            padding: '12px',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            background: 'rgba(255,255,255,0.02)'
                                        }}>
                                            {item.image || item.thumbnail ? (
                                                <img
                                                    src={item.image || item.thumbnail}
                                                    alt="thumb"
                                                    style={{ width: 60, height: 60, borderRadius: '12px', objectFit: 'cover' }}
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            ) : (
                                                <div style={{ width: 60, height: 60, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Download size={24} color="#4b5563" />
                                                </div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4 style={{ margin: 0, color: 'white', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title || item.name || "Untitled Result"}</h4>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                    {item.size && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>{item.size}</span>}
                                                    {item.version && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>v{item.version}</span>}
                                                </div>
                                            </div>
                                            <a
                                                href={item.link || item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="download-link-btn"
                                                style={{
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    padding: '8px 12px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 800,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                {(item.link || item.url)?.includes('drive.google') ? 'DRIVE' : 'DOWNLOAD'}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', marginTop: '1.5rem', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' }}>{selectedApi.responseType === 'image' ? 'Generated Image' : 'JSON Response'}</span>
                                    {response.status && <span style={{ fontSize: '0.7rem', background: 'var(--success)', color: 'black', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>200 OK</span>}
                                </div>
                                {!response.type && (
                                    <button onClick={() => copyToClipboard(JSON.stringify(response, null, 2))} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Copy size={14} /> Copy
                                    </button>
                                )}
                            </div>
                            <div className="response-area" style={{ display: response.type === 'image' ? 'flex' : 'block', justifyContent: 'center' }}>
                                {response.type === 'image' ? (
                                    <img src={response.url} alt="Generated" style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />
                                ) : (
                                    <pre style={{ maxHeight: '300px' }}>{JSON.stringify(response, null, 2)}</pre>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
