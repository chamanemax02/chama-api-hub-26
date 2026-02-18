import React from 'react';

/**
 * AdContainer component for Adsterra / Monetag placements
 */
export function AdContainer() {
    return (
        <div className="ad-wrapper animate-fade-in" style={{
            marginTop: '2rem',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sponsored Content</p>

            {/* Adsterra Container */}
            <div id="container-e8f9f018017d278944e2446554c3938e"></div>

            {/* Optional Ad Links */}
            {/* <a href="https://www.effectivegatecpm.com/qgic3vpu?key=0579f0f6edb57eea87ca96b7179782bf" target="_blank" rel="noopener noreferrer">Support Chama Hub</a> */}
            {/* <a href="https://otieu.com/4/10577518" target="_blank" rel="noopener noreferrer">Support api Hub</a> */}
        </div>
    );
}
