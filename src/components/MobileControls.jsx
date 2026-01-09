import React from 'react';

const MobileControls = () => {
    const dispatchKey = (key) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: key, bubbles: true }));
    };

    return (
        <div className="mobile-controls">
            <div className="d-pad">
                <button className="d-btn up" onClick={() => dispatchKey('ArrowUp')}>▲</button>
                <div className="d-row">
                    <button className="d-btn left" onClick={() => dispatchKey('ArrowLeft')}>◀</button>
                    <button className="d-btn enter" onClick={() => dispatchKey('Enter')}>●</button>
                    <button className="d-btn right" onClick={() => dispatchKey('ArrowRight')}>▶</button>
                </div>
                <button className="d-btn down" onClick={() => dispatchKey('ArrowDown')}>▼</button>
            </div>

            <style jsx>{`
                .mobile-controls {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    z-index: 10000;
                    display: none; /* Hidden by default, shown via media query in index.css */
                    pointer-events: auto;
                }

                @media (max-width: 768px) {
                    .mobile-controls {
                        display: block;
                    }
                }

                .d-pad {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }

                .d-row {
                    display: flex;
                    gap: 10px;
                }

                .d-btn {
                    width: 50px;
                    height: 50px;
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid #2dfccc;
                    color: #2dfccc;
                    border-radius: 12px;
                    font-size: 1.2rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 0 10px rgba(45, 252, 204, 0.2);
                    transition: all 0.2s;
                    user-select: none;
                }

                .d-btn:active {
                    background: #2dfccc;
                    color: #000;
                    transform: scale(0.95);
                }

                .d-btn.enter {
                    border-color: #d92b6b;
                    color: #d92b6b;
                    box-shadow: 0 0 10px rgba(217, 43, 107, 0.2);
                }

                .d-btn.enter:active {
                    background: #d92b6b;
                    color: #fff;
                }
            `}</style>
        </div>
    );
};

export default MobileControls;
