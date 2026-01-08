import React, { useEffect, useState } from 'react';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('BOOTING_KERNEL...');

    useEffect(() => {
        const texts = [
            'INITIALIZING_NEO_DRIVERS...',
            'SYNCING_MOTHERBOARD_TRACES...',
            'ALLOCATING_GLASS_BUFFERS...',
            'ESTABLISHING_VIRTUAL_LINK...',
            'SYSTEM_READY'
        ];

        let currentIdx = 0;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 300);
                    return 100;
                }
                if (prev % 20 === 0) {
                    setLoadingText(texts[currentIdx]);
                    currentIdx = Math.min(currentIdx + 1, texts.length - 1);
                }
                return prev + 1;
            });
        }, 15);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="loading-screen">
            <div className="loader-content">
                <div className="loader-logo">ESCO.IO</div>
                <div className="loader-bar-container">
                    <div className="loader-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="loader-status">
                    <span className="status-label">{loadingText}</span>
                    <span className="status-percent">{progress}%</span>
                </div>
            </div>
            <div className="loader-grid"></div>
        </div>
    );
};

export default LoadingScreen;
