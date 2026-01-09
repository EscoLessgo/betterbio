import React from 'react';

const CONTENT = {
    // ROOT NODES
    velarix: {
        title: "root@velarix: ~/solutions",
        content: (
            <>
                <h1>VELARIX SOLUTIONS</h1>
                <p>Enterprise-grade digital infrastructure and crypto-native web systems.</p>
                <div className="terminal-data-grid">
                    <div className="data-row"><span>STATUS:</span> <span className="text-green">ONLINE</span></div>
                    <div className="data-row"><span>NODES:</span> <span>3</span></div>
                    <div className="data-row"><span>UPTIME:</span> <span>99.98%</span></div>
                </div>
            </>
        )
    },
    veroe_fun: {
        title: "root@esco: ~/main_hub",
        content: (
            <>
                <h1>ESCO.IO HUB</h1>
                <p>Central nexus for creative experiments, interactive portfolios, and 3D web experiences.</p>
                <p>Navigate sub-nodes to access specific project builds.</p>
            </>
        )
    },
    veroe_space: {
        title: "root@quietbin: ~/archive",
        content: (
            <>
                <h1>QUIETBIN ARCHIVE</h1>
                <p>Secure data storage and legacy artifact repository.</p>
                <p>Access restricted to authorized personnel only.</p>
            </>
        )
    },
    // DEFAULT GENERIC
    default: {
        title: "root@system: ~/observing",
        content: (
            <>
                <h1>NODE_SELECTED</h1>
                <p>Awaiting interaction...</p>
                <p>Press [ENTER] to access node or [SPACE] to visit link.</p>
            </>
        )
    }
};

const Terminal = ({ isOpen, onClose, view }) => {
    if (!view) return null;
    const viewId = typeof view === 'string' ? view : view.id;
    // Map children to their parent generic content if specific content missing, or default
    let data = CONTENT[viewId];

    if (!data) {
        // Fallback logic
        data = CONTENT['default'];
        if (view.label) {
            data = {
                title: `root@node: ~/${view.label.toLowerCase()}`,
                content: (
                    <>
                        <h1>{view.label}</h1>
                        <p>{view.sub || 'System Node'}</p>
                        {view.url && <p className="url-link">LINK: {view.url}</p>}
                    </>
                )
            };
        }
    }

    return (
        <div className={`terminal-window ${isOpen ? 'active' : ''}`}>
            <div className="terminal-header">
                <div className="terminal-title">{data.title}</div>
                <button className="close-btn" onClick={onClose}>[X] ESC</button>
            </div>
            <div className="terminal-content">
                {data.content}
            </div>
        </div>
    );
};

export default Terminal;
