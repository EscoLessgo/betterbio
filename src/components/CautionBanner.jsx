import React, { useState } from 'react';

const CautionBanner = () => {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            maxWidth: '380px',
            background: 'rgba(255, 196, 0, 0.1)',
            border: '1px solid #ffcc00',
            borderLeft: '4px solid #ffcc00',
            backdropFilter: 'blur(10px)',
            color: '#ffcc00',
            padding: '1.2rem',
            fontFamily: '"Roboto Mono", monospace',
            fontSize: '0.8rem',
            lineHeight: '1.5',
            zIndex: 10000,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            pointerEvents: 'auto',
            animation: 'slideInLeft 0.5s ease-out backwards'
        }}>
            <style>{`
                @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes heavyFlash { 
                    0%, 100% { opacity: 1; } 
                    50% { opacity: 0.5; color: #ff0040; } 
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <strong style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontSize: '1.4rem',
                    fontWeight: 900 // EXTRA BOLD
                }}>
                    <span style={{ fontSize: '1.5em' }}>⚠️</span> ATTENTION
                </strong>
                <button
                    onClick={() => setVisible(false)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        fontSize: '2rem',
                        padding: '0 0.5rem',
                        lineHeight: 1,
                        marginTop: '-10px'
                    }}
                >
                    ×
                </button>
            </div>

            <div style={{
                fontWeight: 900,
                fontSize: '1.1rem',
                marginBottom: '1rem',
                animation: 'heavyFlash 1s infinite alternate-reverse' // BLINKING
            }}>
                THIS EXPERIENCE REQUIRES HEAVY 3D RENDERING. <br />
                PLEASE ALLOW 3-5 SECONDS FOR THE ENVIRONMENT TO COMPILE.
            </div>

            <div style={{
                fontWeight: 'bold',
                color: '#ffaa00',
                borderTop: '2px solid #ffcc00',
                paddingTop: '1rem',
                marginTop: '1rem'
            }}>
                NOTE: EXPECT MOMENTARY STUTTERING/FREEZING ON LOAD.
            </div>
        </div>
    );
};

export default CautionBanner;
