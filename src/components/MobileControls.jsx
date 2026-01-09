import React from 'react';

const MobileControls = () => {
    const dispatchKey = (key) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: key, bubbles: true }));
    };

    return (
        <div className="mobile-controls">
            {/* Directional Pad */}
            <div className="d-pad-container">
                <div className="d-pad-row">
                    <button className="d-btn up" onPointerDown={() => dispatchKey('ArrowUp')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z" /></svg>
                    </button>
                </div>
                <div className="d-pad-row mid">
                    <button className="d-btn left" onPointerDown={() => dispatchKey('ArrowLeft')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 7l-5 5 5 5V7z" /></svg>
                    </button>
                    <div className="d-spacer"></div>
                    <button className="d-btn right" onPointerDown={() => dispatchKey('ArrowRight')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 17l5-5-5-5v10z" /></svg>
                    </button>
                </div>
                <div className="d-pad-row">
                    <button className="d-btn down" onPointerDown={() => dispatchKey('ArrowDown')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z" /></svg>
                    </button>
                </div>
            </div>

            {/* Action Button (Separate) */}
            <button className="action-btn" onPointerDown={() => dispatchKey('Enter')}>
                ENTER
            </button>

            <style jsx>{`
                .mobile-controls {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 10001;
                    display: none;
                }

                @media (max-width: 768px) {
                    .mobile-controls {
                        display: block;
                    }
                }

                /* Layout Grid for Controls */
                .d-pad-container {
                    position: absolute;
                    bottom: 2rem;
                    left: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    pointer-events: auto;
                }

                .d-pad-row {
                    display: flex;
                    gap: 5px;
                }
                
                .d-pad-row.mid {
                    gap: 5px;
                }

                .d-spacer {
                    width: 60px;
                    height: 60px;
                }

                .d-btn {
                    width: 60px;
                    height: 60px;
                    background: rgba(10, 15, 20, 0.4);
                    border: 1px solid rgba(45, 252, 204, 0.3);
                    color: rgba(45, 252, 204, 0.8);
                    border-radius: 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    backdrop-filter: blur(5px);
                    transition: all 0.1s;
                    touch-action: manipulation;
                }

                .d-btn:active {
                    background: rgba(45, 252, 204, 0.2);
                    transform: scale(0.95);
                    color: #fff;
                }

                /* Action Button - Big and Bottom Right */
                .action-btn {
                    position: absolute;
                    bottom: 3rem;
                    right: 2rem;
                    width: 90px;
                    height: 90px;
                    background: rgba(217, 43, 107, 0.2);
                    border: 2px solid rgba(217, 43, 107, 0.5);
                    color: #fff;
                    border-radius: 50%;
                    font-weight: 900;
                    font-family: 'Roboto Mono', monospace;
                    font-size: 0.9rem;
                    letter-spacing: 1px;
                    pointer-events: auto;
                    backdrop-filter: blur(5px);
                    box-shadow: 0 0 20px rgba(217, 43, 107, 0.2);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    touch-action: manipulation;
                }

                .action-btn:active {
                    background: rgba(217, 43, 107, 0.6);
                    transform: scale(0.95);
                    box-shadow: 0 0 30px rgba(217, 43, 107, 0.5);
                }
            `}</style>
        </div>
    );
};

export default MobileControls;
