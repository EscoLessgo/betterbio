import React from 'react';

const CONTENT = {
    home: {
        title: "root@esco: ~/home",
        content: (
            <>
                <h1>Esco.io Interface</h1>
                <p>I am a creative developer specializing in 3D web experiences, digital architecture, and interactive design.</p>
                <p>This environment is a technical showcase of React Three Fiber and precision WebGL interactivity.</p>
            </>
        )
    },
    projects: {
        title: "root@esco: ~/projects",
        content: (
            <>
                <h1>Development log</h1>
                <ul>
                    <li><strong>Neural Grid:</strong> A real-time data visualization engine.</li>
                    <li><strong>Ghost Shell:</strong> Advanced GLSL shader experimentation.</li>
                    <li><strong>Vector Flow:</strong> Kinetic typography and motion systems.</li>
                </ul>
            </>
        )
    },
    about: {
        title: "root@esco: ~/about",
        content: (
            <>
                <h1>Identity Profile</h1>
                <p>Obsessed with the synthesis of raw technology and aesthetic minimalism.</p>
                <p>Stack: React, Three.js, GLSL, WebAssembly, and Systems Architecture.</p>
            </>
        )
    },
    contact: {
        title: "root@esco: ~/contact",
        content: (
            <>
                <h1>Establish Connection</h1>
                <p>Email: admin@esco.io</p>
                <p>GitHub: @esco_dev</p>
                <p>Network: Encrypted_Node_01</p>
            </>
        )
    }
};

const Terminal = ({ isOpen, onClose, view }) => {
    if (!view) return null;
    const viewId = typeof view === 'string' ? view : view.id;
    const data = CONTENT[viewId] || CONTENT['home'];

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
