import React from 'react';
import { Clock, Tag, User } from 'lucide-react';

export function NewsFeed({ news }) {
    if (!news || news.length === 0) {
        return (
            <div className="news-feed animate-fade-in">
                <div className="card glass" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: '#6b7280' }}>No broadcasts received from the matrix yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="news-feed animate-fade-in">
            <h2 className="cyber-title" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>SYSTEM <span style={{ color: 'var(--primary)' }}>NEWS</span></h2>
            {news.map((item) => (
                <div key={item.id} className="news-card glass">
                    {item.image && (
                        <div className="news-image">
                            <img src={item.image} alt="" />
                        </div>
                    )}
                    <div className="news-content">
                        <div className="news-meta">
                            <div className="news-version">{item.version || 'GLOBAL'}</div>
                            <div className="news-date">
                                <Clock size={12} style={{ marginRight: '5px' }} />
                                {new Date(item.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                        <h2>{item.title}</h2>
                        <div className="news-text">
                            {item.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                        </div>
                        <div className="news-author">
                            <User size={12} style={{ marginRight: '5px' }} />
                            Broadcasted by {item.author}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
