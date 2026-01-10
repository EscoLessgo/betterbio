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
        { label: 'ESCO', url: 'https://esco.veroe.fun' },
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
        <div className="safe-mode-container">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div style={{
                marginBottom: '4rem',
                textAlign: 'center',
                animation: 'fadeIn 1s ease-out'
            }}>
                <h1 style={{
                    fontSize: 'clamp(3rem, 6vw, 6rem)',
                    margin: '0 0 1.5rem 0',
                    color: '#fff',
                    letterSpacing: '-2px',
                    animation: 'neonPulse 3s infinite alternate'
                }}>
                    ESCO.VEROE.FUN
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                    <div style={{
                        border: '2px solid #ff0055',
                        background: 'rgba(255, 0, 85, 0.05)',
                        padding: '1rem 3rem',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#ff4488',
                        letterSpacing: '1px'
                    }}>
                        ⚠ 3D_ACCELERATION_OFFLINE
                    </div>

                    {/* OPERATING INSTRUCTIONS */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        marginTop: '1rem'
                    }}>
                        <div className="control-group">
                            <div>
                                <span className="key-cap">W</span>
                                <span className="key-cap">A</span>
                                <span className="key-cap">S</span>
                                <span className="key-cap">D</span>
                            </div>
                            <span className="control-desc">NAVIGATE_NODES</span>
                        </div>

                        <div className="control-group">
                            <div>
                                <span className="key-cap">↵ Enter</span>
                            </div>
                            <span className="control-desc">EXECUTE_LINK</span>
                        </div>

                        <div className="control-group">
                            <div>
                                <span className="key-cap">ESC</span>
                            </div>
                            <span className="control-desc">BACK_DIRECTORY</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowFix(!showFix)}
                        style={{
                            background: showFix ? '#fff' : 'transparent',
                            border: '1px solid #666',
                            color: showFix ? '#000' : '#888',
                            padding: '1rem 2rem',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            transition: 'all 0.2s',
                            marginTop: '1rem'
                        }}
                    >
                        {showFix ? 'CLOSE_INSTRUCTIONS' : 'ENABLE_3D_GRAPHICS?'}
                    </button>
                </div>
            </div>

            {showFix && (
                <div style={{
                    maxWidth: '800px',
                    width: '100%',
                    background: '#111',
                    border: '2px solid #fff',
                    padding: '3rem',
                    marginBottom: '5rem',
                    animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <h2 style={{ margin: '0 0 2rem 0', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                        FIREFOX CONFIGURATION
                    </h2>
                    <ol style={{ margin: 0, paddingLeft: '2rem', color: '#ccc', lineHeight: '2', fontSize: '1.2rem' }}>
                        <li>Type <code style={{ color: '#00ffff', background: '#000', padding: '4px 10px', fontSize: '1.1em' }}>about:config</code> in the address bar.</li>
                        <li>Click <strong>"Accept the Risk"</strong>.</li>
                        <li>Search for <code style={{ color: '#00ffff', background: '#000', padding: '4px 10px', fontSize: '1.1em' }}>webgl.force-enabled</code>.</li>
                        <li>Double-click to set: <strong>TRUE</strong>.</li>
                        <li>Refresh this page.</li>
                    </ol>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                gap: '3rem',
                width: '100%',
                maxWidth: '1600px',
                padding: '0 2rem'
            }}>
                {Object.entries(DOMAIN_GROUPS).map(([domain, links], idx) => (
                    <div key={domain} className="domain-card" style={{
                        animation: `slideUp 0.6s ease-out ${idx * 0.1}s backwards`
                    }}>
                        <h2 style={{
                            fontSize: '2rem',
                            color: domain.includes('VEROE') ? '#ff0077' : domain.includes('VELARIX') ? '#00ffff' : '#ffaa00',
                            borderBottom: '2px solid #333',
                            paddingBottom: '2rem',
                            marginBottom: '3rem',
                            letterSpacing: '2px',
                            textAlign: 'center'
                        }}>
                            {domain}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                            {links.map(link => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link-item"
                                >
                                    <span>{link.label}</span>
                                    <span style={{ fontSize: '1.5em', opacity: 0.5 }}>↗</span>
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SafeModeApp;
