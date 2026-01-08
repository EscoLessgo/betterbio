import React, { useState } from 'react';

const DOMAIN_GROUPS = {
    'VELARIXSOLUTIONS.NL': [
        { label: 'MAIN_ROOT', url: 'https://velarixsolutions.nl' },
        { label: '404_GATE', url: 'https://404.velarixsolutions.nl' },
        { label: 'CRYPTO', url: 'https://crypto.velarixsolutions.nl' },
        { label: 'FIND', url: 'https://find.velarixsolutions.nl' },
        { label: 'INLET', url: 'https://inlet.velarixsolutions.nl' },
    ],
    'VEROE.FUN': [
        { label: 'ESCOSIGNS', url: 'https://escosigns.veroe.fun' },
        { label: 'SPOTI', url: 'https://spoti.veroe.fun' },
        { label: 'TNT_CORE', url: 'https://tnt.veroe.fun' },
        { label: 'FIGHT_ROOM', url: 'https://fight.veroe.fun' },
        { label: 'MORE_DATA', url: 'https://more.veroe.fun' },
    ],
    'QUIETBIN.SPACE': [
        { label: 'ROOT_SHARD', url: 'https://veroe.space' },
    ]
};

const SafeModeApp = () => {
    const [showFix, setShowFix] = useState(false);

    return (
        <div style={{
            background: '#020202',
            minHeight: '100vh',
            fontFamily: "'Courier New', monospace",
            padding: '4rem 2rem',
            color: '#e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto'
        }}>
            <div style={{
                marginBottom: '3rem',
                textAlign: 'center',
                animation: 'fadeIn 1s ease-out'
            }}>
                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                    margin: '0 0 1rem 0',
                    color: '#fff',
                    letterSpacing: '-2px',
                    textShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
                    animation: 'glowPulse 3s infinite alternate'
                }}>
                    ESCO.VEROE.FUN
                </h1>

                <div style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        border: '1px solid #333',
                        background: '#0a0a0a',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        color: '#ff4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{ animation: 'blink 1s infinite' }}>●</span>
                        3D_CONTEXT_FAILURE // FALLBACK_ACTIVE
                    </div>

                    <button
                        onClick={() => setShowFix(!showFix)}
                        style={{
                            background: 'transparent',
                            border: '1px solid #444',
                            color: '#888',
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#fff';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#444';
                            e.currentTarget.style.color = '#888';
                        }}
                    >
                        {showFix ? 'HIDE_FIX_INSTRUCTIONS' : 'HOW_TO_ENABLE_WEBGL?'}
                    </button>
                </div>
            </div>

            {showFix && (
                <div style={{
                    maxWidth: '600px',
                    width: '100%',
                    background: '#111',
                    border: '1px solid #333',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '3rem',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>🦊 Firefox WebGL Core Fix</h3>
                    <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#ccc', lineHeight: '1.6' }}>
                        <li>Type <code style={{ color: '#00ffff', background: '#000', padding: '2px 6px' }}>about:config</code> in your address bar and press Enter.</li>
                        <li>Click <strong>"Accept the Risk and Continue"</strong>.</li>
                        <li>Search for <code style={{ color: '#00ffff', background: '#000', padding: '2px 6px' }}>webgl.force-enabled</code>.</li>
                        <li>Double-click it to set it to <strong>true</strong>.</li>
                        <li>Restart Firefox and refresh this page.</li>
                    </ol>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                width: '100%',
                maxWidth: '1200px'
            }}>
                {Object.entries(DOMAIN_GROUPS).map(([domain, links], idx) => (
                    <div key={domain} style={{
                        background: '#080808',
                        border: '1px solid #222',
                        borderRadius: '12px',
                        padding: '2rem',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        animation: `slideUp 0.5s ease-out ${idx * 0.1 + 0.2}s backwards`
                    }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                            e.currentTarget.style.borderColor = '#444';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = '#222';
                        }}
                    >
                        <h2 style={{
                            fontSize: '1rem',
                            color: '#666',
                            borderBottom: '1px solid #222',
                            paddingBottom: '1rem',
                            marginBottom: '1.5rem',
                            letterSpacing: '2px',
                            fontWeight: 'normal'
                        }}>
                            {domain}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {links.map(link => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'block',
                                        padding: '1rem',
                                        background: '#111',
                                        color: '#ccc',
                                        textDecoration: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        transition: '0.2s',
                                        border: '1px solid transparent',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = '#eee';
                                        e.currentTarget.style.color = '#000';
                                        e.currentTarget.style.fontWeight = 'bold';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = '#111';
                                        e.currentTarget.style.color = '#ccc';
                                        e.currentTarget.style.fontWeight = 'normal';
                                    }}
                                >
                                    {link.label} ↗
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes glowPulse { from { text-shadow: 0 0 20px rgba(0, 255, 255, 0.1); } to { text-shadow: 0 0 40px rgba(0, 255, 255, 0.4); } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
            `}</style>
        </div>
    );
};

export default SafeModeApp;
