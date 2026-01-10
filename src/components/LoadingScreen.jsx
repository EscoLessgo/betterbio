import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const LoadingScreen = ({ onComplete }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [hasAcknowledged, setHasAcknowledged] = useState(false);

    useEffect(() => {
        // Simple entry fade-in for the logo/bg
        gsap.to('.loader-logo-container', {
            opacity: 1,
            duration: 2,
            ease: "power2.inOut",
        });
    }, []);

    const handleAck = () => {
        setHasAcknowledged(true);
    };

    const handleEnter = (startMuted = false) => {
        // Exit Animation
        gsap.to(containerRef.current, {
            opacity: 0,
            duration: 1,
            onComplete: () => onComplete({ muted: startMuted })
        });
    };

    return (
        <div className="loading-screen" ref={containerRef}>
            {/* Cinematic Letterbox Bars */}
            <div className="cinema-bar top"></div>
            <div className="cinema-bar bottom"></div>

            <div className="loader-content">
                <div className="loader-logo-container" style={{ opacity: 0, scale: 0.8, filter: 'blur(10px)', marginBottom: '20px' }}>
                    <video
                        className="dripping-logo"
                        src="/esconeon.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                </div>

                {!hasAcknowledged ? (
                    <div className="warning-container" style={{ textAlign: 'center', maxWidth: '600px', color: '#eaeaea', fontFamily: 'monospace' }}>

                        <h2 style={{ color: '#2dfccc', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.5rem' }}>
                            ⚠ High Performance Required
                        </h2>

                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.9rem', color: '#aaa' }}>
                            This experience requires heavy 3D rendering. <br />
                            <span style={{ color: '#fff' }}>Please allow 3-5 seconds for the environment to compile.</span>
                            <br /><br />
                            <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>NOTE: EXPECT MOMENTARY STUTTERING/FREEZING ON LOAD.</span>
                        </p>

                        <div className="hw-instructions" style={{
                            background: 'rgba(0,0,0,0.6)',
                            border: '1px solid #333',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            textAlign: 'left',
                            fontSize: '0.8rem',
                            lineHeight: '1.8'
                        }}>
                            <strong style={{ color: '#d92b6b', display: 'block', marginBottom: '0.5rem' }}>ENABLE HARDWARE ACCELERATION:</strong>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ marginBottom: '0.5rem' }}><b style={{ color: '#fff' }}>Chrome / Edge:</b> Settings {'>'} System {'>'} "Use graphics acceleration when available"</li>
                                <li style={{ marginBottom: '0.5rem' }}><b style={{ color: '#fff' }}>Firefox:</b> Settings {'>'} General {'>'} Performance {'>'} Uncheck "Recommended" {'>'} Check "Use hardware acceleration"</li>
                                <li style={{ marginBottom: '0.5rem' }}><b style={{ color: '#fff' }}>Brave:</b> Settings {'>'} System {'>'} "Use graphics acceleration when available"</li>
                                <li><b style={{ color: '#fff' }}>Opera:</b> Settings {'>'} Browser {'>'} System {'>'} "Use hardware acceleration"</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleAck}
                            style={{
                                background: '#d00040', // RED
                                color: '#fff',
                                border: 'none',
                                padding: '1rem 2rem',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                letterSpacing: '2px',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#ff0055'}
                            onMouseLeave={e => e.currentTarget.style.background = '#d00040'}
                        >
                            I Understand - Initialize
                        </button>
                    </div>
                ) : (
                    <div className="entry-controls-grid" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                        <button className="option-card sound-on" onClick={() => handleEnter(false)}>
                            <div className="card-icon">🔊</div>
                            <div className="card-label">SYSTEM_AUDIO</div>
                            <div className="card-sub">IMMERSIVE EXPERIENCE</div>
                        </button>
                        <button className="option-card sound-off" onClick={() => handleEnter(true)}>
                            <div className="card-icon">🔇</div>
                            <div className="card-label">SILENT_MODE</div>
                            <div className="card-sub">STEALTH ENTRY</div>
                        </button>
                    </div>
                )}
            </div>

            <div className="loader-grid"></div>
        </div>
    );
};

export default LoadingScreen;
