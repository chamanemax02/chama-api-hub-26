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
                            {/* Visual UI removed per user request */}

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
