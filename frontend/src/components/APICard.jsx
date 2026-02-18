import React from 'react';
import { ChevronRight } from 'lucide-react';

export function APICard({ api, onClick }) {
    return (
        <div className="api-card" style={{ position: 'relative' }}>
            {api.isNew && (
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
                    zIndex: 2,
                    border: '2px solid #1c1e2d'
                }}>NEW</div>
            )}
            <div className="card-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <img
                    src={api.icon}
                    alt="api"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/logo.png";
                    }}
                    style={{ width: 40, height: 40, borderRadius: '10px', objectFit: 'contain' }}
                />
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{api.name}</h3>
            </div>
            <p className="card-desc" style={{ fontSize: '0.85rem', minHeight: '40px' }}>{api.desc}</p>
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <button className="btn-get" onClick={onClick}>
                    <ChevronRight size={18} style={{ marginRight: '5px' }} /> GET
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="status-dot ready" style={{
                        width: 8,
                        height: 8,
                        background: '#10b981',
                        borderRadius: '50%',
                        boxShadow: '0 0 10px #10b981'
                    }}></div>
                    <span style={{
                        fontSize: '0.75rem',
                        color: '#10b981',
                        fontWeight: 600
                    }}>
                        Ready
                    </span>
                </div>
            </div>
        </div>
    );
}
