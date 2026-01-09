import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import Terminal from './components/Terminal';
import LoadingScreen from './components/LoadingScreen';
import { trackPageView } from './utils/analytics';
import './index.css';

const BottomTag = () => (
  <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', textAlign: 'right', pointerEvents: 'none', zIndex: 10 }}>
    <div className="logo glitch-text" data-text="esco.io" style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-2px' }}>esco.io</div>
    <div className="system-status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '0.5rem', gap: '0.2rem' }}>
      <span className="status-bit pulse" style={{ fontSize: '0.8rem', opacity: 0.7 }}>neural_link_established</span>
      <span className="status-bit" style={{ fontSize: '0.8rem', opacity: 0.5 }}>core_v1.8.0</span>
    </div>
  </div>
);

const NavHint = () => (
  <div className="nav-hints-bar">
    <div className="hint-pill">
      <span className="hint-icon">↵</span>
      <span className="hint-label">CONFIRM_LINK</span>
    </div>
    <div className="hint-pill">
      <span className="hint-icon">A/D</span>
      <span className="hint-label">SWIPE_TRUNKS</span>
    </div>
    <div className="hint-pill">
      <span className="hint-icon">W/S</span>
      <span className="hint-label">DATA_SCROLL</span>
    </div>
    <div className="hint-pill">
      <span className="hint-icon">ESC</span>
      <span className="hint-label">BACK_DIR</span>
    </div>
  </div>
);

const KeybindOverlay = () => (
  <div className="keybind-overlay" style={{ pointerEvents: 'auto' }}>
    <div className="instruction-box">
      <img
        src="/esco_keybind_instructions_1767870360807.png"
        alt="Keybinds"
        className="keybind-img"
      />
      <div className="instruction-text">CONTROLS_OVERLAY</div>
    </div>
  </div>
);

function App() {
  const [activeView, setActiveView] = useState(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isCentering, setIsCentering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    trackPageView();

    // Glitch Config
    const baseTitle = "esco.io";
    const glitchedTitles = [
      "3sco.1o", "e$co.io", "esc0.io", "3$c0.10", "ESCO.IO",
      "es<o.io", "esc[].io", "35c0.10", "e_co.io", "esco.!o"
    ];

    // Favicon Setup
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const colors = ['#d92b6b', '#2dfccc', '#e8f080', '#ffffff', '#2dfccc'];

    // Create/Find Link Element for favicon
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    let frame = 0;

    const interval = setInterval(() => {
      // Terminal Cursor Blink Effect
      const titles = ["esco.io", "esco.io_"];
      const titleIndex = Math.floor(Date.now() / 800) % 2; // Blink every 800ms
      document.title = titles[titleIndex];

      // 2. Color Pulse Favicon
      ctx.clearRect(0, 0, 32, 32);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 32, 32);

      ctx.font = 'bold 20px "Courier New"';
      ctx.fillStyle = colors[frame % colors.length];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(baseTitle[frame % baseTitle.length].toUpperCase(), 16, 16);

      link.href = canvas.toDataURL('image/png');

      frame++;
    }, 100); // Slower interval for favicon animation, title handles its own timing via Date.now()

    return () => clearInterval(interval);
  }, []);

  const handleNodeActive = (node) => {
    if (!node) return;
    setActiveView(node);
    setShowTerminal(true);
    trackPageView(`/node/${node.id || 'unknown'}`);
  };

  const closeTerminal = () => setShowTerminal(false);
  const handleRecenter = () => setIsCentering(true);

  return (
    <div className="app-container">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      <BottomTag />

      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 0, 35], fov: 40 }}
        >
          <color attach="background" args={['#030508']} />

          {!isLoading && (
            <Suspense fallback={null}>
              <Experience
                onNodeActive={handleNodeActive}
                activeView={activeView}
                isCentering={isCentering}
                onCenterComplete={() => setIsCentering(false)}
              />
            </Suspense>
          )}

          <ambientLight intensity={1} />
          <spotLight position={[20, 30, 20]} angle={0.2} penumbra={1} intensity={100} color="#2dfccc" castShadow decay={0} />
          <pointLight position={[-20, 20, 10]} intensity={50} color="#d92b6b" decay={0} />
          <pointLight position={[20, -20, 10]} intensity={50} color="#2dfccc" decay={0} />
        </Canvas>
      </div>

      <div className="ui-layer">
        <Terminal
          isOpen={showTerminal}
          onClose={closeTerminal}
          view={activeView}
        />

        <div className="top-tools">
          <button className="recenter-btn" onClick={handleRecenter}>
            SYNC_VIEW
          </button>
        </div>

        <NavHint />
        <KeybindOverlay />
      </div>
    </div>
  );
}

export default App;
