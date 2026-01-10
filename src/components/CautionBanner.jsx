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
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <strong style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.9rem'
                }}>
                    <span style={{ fontSize: '1.2em' }}>⚠️</span> Performance Warning
                </strong>
                <button
                    onClick={() => setVisible(false)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0 0.5rem',
                        lineHeight: 1,
                        marginTop: '-4px'
                    }}
                >
                    ×
                </button>
            </div>

            <div style={{ fontWeight: 500, opacity: 0.9, marginBottom: '0.8rem' }}>
                YOU WILL PROBABLY STUTTER OR FREEZE MOMENTARILY WHILE THE SITE LOADS. I'M NEW TO REACT THREE/FIBER SO CUT ME SOME SLACK :)
            </div>

            <div style={{ textAlign: 'right', fontStyle: 'italic', opacity: 0.7 }}>
                - esco
            </div>
        </div>
    );
};

export default CautionBanner;
