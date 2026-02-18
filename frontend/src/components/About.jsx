import React from 'react';
import { Info, Shield, Zap, Heart } from 'lucide-react';

export function About() {
    return (
        <div className="animate-slide-up" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="hero-section" style={{ minHeight: 'auto', padding: '2rem 0', marginBottom: '3rem' }}>
                <div className="hero-text">
                    <h1 style={{ fontSize: '4rem' }}>ABOUT CHAMA HUB</h1>
                    <p>Experience the ultimate power of APIs. Chama Hub is a premium platform providing high-performance tools for developers and creators.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
                <div className="api-card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="logo-icon" style={{ background: 'var(--primary)', width: '40px', height: '40px' }}>
                            <Zap size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>High Performance</h3>
                    </div>
                    <p className="card-desc">Our APIs are optimized for speed and reliability, ensuring you get results in milliseconds.</p>
                </div>

                <div className="api-card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="logo-icon" style={{ background: '#3b82f6', width: '40px', height: '40px' }}>
                            <Shield size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Secure & Private</h3>
                    </div>
                    <p className="card-desc">We prioritize your privacy and data security. All requests are encrypted and handled safely.</p>
                </div>

                <div className="api-card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="logo-icon" style={{ background: '#10b981', width: '40px', height: '40px' }}>
                            <Info size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Easy Integration</h3>
                    </div>
                    <p className="card-desc">With clear documentation and simple endpoints, integrating our APIs into your project is a breeze.</p>
                </div>

                <div className="api-card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="logo-icon" style={{ background: '#f43f5e', width: '40px', height: '40px' }}>
                            <Heart size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Community Driven</h3>
                    </div>
                    <p className="card-desc">Built with love by Chama Ofc. We constantly update our hub based on community feedback.</p>
                </div>
            </div>

            <div className="api-card" style={{ padding: '3rem', marginBottom: '3rem' }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>EXPLORE OUR ECOSYSTEM</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.8', textAlign: 'left' }}>
                    <p style={{ marginBottom: '1.5rem' }}>
                        Chama API Hub is a comprehensive digital toolkit designed to empower developers, content creators, and automation enthusiasts. We provide a wide array of high-quality endpoints, categorized to meet your specific needs:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', listStyleType: 'circle' }}>
                        <li><strong>Media Downloads:</strong> Effortlessly extract videos and audio from platforms like Facebook, TikTok, YouTube, Pinterest, and MediaFire. Our scrapers are built to handle various URL formats, including mobile share links.</li>
                        <li><strong>APK Repository:</strong> Search and download Android applications from multiple trusted sources like AN1, HappyMod, and APKPure, all through a unified interface.</li>
                        <li><strong>Search & Discovery:</strong> Find any type of content with our advanced search APIs, spanning from web results to specific media databases.</li>
                        <li><strong>Utility Tools:</strong> Access a suite of helper functions, including AI-powered processing, past paper discovery, and file conversion tools.</li>
                    </ul>
                </div>
            </div>

            <div className="api-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ marginBottom: '1rem', color: '#fff' }}>OUR MISSION</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                    To provide a unified hub for all digital tools, making advanced features accessible to everyone.
                    By centralizing complex web scraping and data processing into simple, reliable JSON endpoints, we enable you to focus on building what matters.
                </p>
            </div>
        </div>
    );
}
