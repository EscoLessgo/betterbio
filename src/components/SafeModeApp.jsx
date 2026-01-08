import React from 'react';

const SafeModeApp = () => {
    const links = [
        { label: 'VELARIXSOLUTIONS.NL', url: 'https://velarixsolutions.nl', color: '#00ffff' },
        { label: 'VEROE.FUN', url: 'https://veroe.fun', color: '#ff0077' },
        { label: 'QUIETBIN.SPACE', url: 'https://veroe.space', color: '#ffd700' },
        { label: 'ESCOSIGNS', url: 'https://escosigns.veroe.fun', color: '#00ff00' },
        { label: 'SPOTI', url: 'https://spoti.veroe.fun', color: '#1db954' },
    ];

    return (
        <div style={{
            background: '#050505',
            minHeight: '100vh',
            fontFamily: 'monospace',
            padding: '2rem',
            color: '#00ffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <h1 style={{
                borderBottom: '2px solid #ff0077',
                paddingBottom: '1rem',
                marginBottom: '2rem',
                textShadow: '2px 2px #ff0077',
                fontSize: '2.5rem'
            }}>
                ESCO.IO_SAFE_MODE
            </h1>

            <div style={{
                border: '1px solid #333',
                padding: '1rem',
                marginBottom: '2rem',
                background: '#0a0a0a',
                maxWidth: '600px',
                textAlign: 'center'
            }}>
                <p style={{ color: '#ff0077', margin: 0 }}>⚠ GPU_ACCELERATION_OFFLINE</p>
                <p style={{ color: '#888', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                    System has switched to fallback interface. 3D context unavailable.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                {links.map(link => (
                    <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'block',
                            padding: '1.5rem',
                            background: '#0a0a0a',
                            border: `1px solid ${link.color}`,
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            transition: '0.2s',
                            textAlign: 'center',
                            boxShadow: `0 0 10px ${link.color}22`
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.background = link.color;
                            e.currentTarget.style.color = '#000';
                            e.currentTarget.style.boxShadow = `0 0 20px ${link.color}`;
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = '#0a0a0a';
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.boxShadow = `0 0 10px ${link.color}22`;
                        }}
                    >
                        {'>'} {link.label}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default SafeModeApp;
