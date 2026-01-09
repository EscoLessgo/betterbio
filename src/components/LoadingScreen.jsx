import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const containerRef = useRef(null);
    const barRef = useRef(null);
    const textRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Cinematic Sequence
        const tl = gsap.timeline();

        // 1. Initial Blackout & Logo Reveal
        tl.to('.loader-logo-container', {
            opacity: 1,
            duration: 2,
            ease: "power2.inOut",
            filter: "blur(0px)",
            scale: 1,
            rotate: 0
        })
            .to('.loader-bar-container', {
                width: '300px',
                opacity: 1,
                duration: 1
            }, "-=1")

            // 2. Simulated Loading Progress
            .to(barRef.current, {
                width: '100%',
                duration: 3.5,
                ease: "expo.out",
                onUpdate: function () {
                    // Approximate progress for number display
                    setProgress(Math.round(this.progress() * 100));
                }
            })

            // 3. Text Cycle
            .to(textRef.current, {
                text: "SYSTEM_READY",
                duration: 0.5,
                onStart: () => {
                    if (textRef.current) textRef.current.innerText = "INITIALIZING...";
                }
            }, "<")

            // 4. Ready State
            .call(() => {
                setIsReady(true);
            });

        return () => tl.kill();
    }, []);

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
                <div className="loader-logo-container" style={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}>
                    <video
                        className="dripping-logo"
                        src="/esconeon.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                </div>

                {!isReady ? (
                    <>
                        <div className="loader-bar-container" style={{ width: 0, opacity: 0 }}>
                            <div className="loader-bar" ref={barRef} style={{ width: '0%' }}></div>
                        </div>
                        <div className="loader-status">
                            <span className="status-label" ref={textRef}>BOOTING_KP_KERNEL...</span>
                            <span className="status-percent">{progress}%</span>
                        </div>
                    </>
                ) : (
                    <div className="entry-controls-grid">
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
