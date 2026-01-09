import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Experience from './components/Experience';
import Terminal from './components/Terminal';
import LoadingScreen from './components/LoadingScreen';
import RagingSea from './components/RagingSea';
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

function App() {
  const [activeView, setActiveView] = useState(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isCentering, setIsCentering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    trackPageView();

    // Setup Canvas for Dynamic Favicon
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Create/Find Link Element
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    // Glitch Config
    const glitchChars = ['e', 's', 'c', 'o', '.', 'i', 'o'];
    const colors = ['#ff0077', '#00ffff', '#ffff00', '#ffffff', '#00ff00'];
    const titles = ['esco.io', 'esco.io_', 'esc0.io', 'esco.1o', 'e$co.io'];

    let frame = 0;

    const interval = setInterval(() => {
      // 1. Dynamic Title Glitch (Fast)
      if (frame % 5 === 0) document.title = titles[Math.floor(Math.random() * titles.length)];

      // 2. Dynamic Pixellated Favicon (The "Colored Text" effect)
      ctx.clearRect(0, 0, 32, 32);

      // Draw background (optional dark mode support)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 32, 32);

      // Draw "E" or "S" or full "ESCO" simplified
      // Since 32px is small, we flash the letters or a simplified block pattern

      // Let's draw "E S" or "C O" alternating with random colors
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Shadow / Glitch offset
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillText('e', 16 + (Math.random() * 4 - 2), 16 + (Math.random() * 4 - 2));

      // Main Character (flashing "e" "s" "c" "o" rapidly)
      const char = glitchChars[frame % 4];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillText(char, 16, 16);

      // Update Favicon
      link.href = canvas.toDataURL('image/png');

      frame++;
    }, 100); // 10FPS updates

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
          <color attach="background" args={['#000103']} />
          <RagingSea />

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

          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 4}
            minDistance={15}
            maxDistance={60}
            dampingFactor={0.05}
            enableDamping
          />

          <ambientLight intensity={1} />
          <spotLight position={[20, 30, 20]} angle={0.2} penumbra={1} intensity={100} color="#00ffff" castShadow decay={0} />
          <pointLight position={[-20, 20, 10]} intensity={50} color="#ff0077" decay={0} />
          <pointLight position={[20, -20, 10]} intensity={50} color="#00ffff" decay={0} />
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
      </div>
    </div>
  );
}

export default App;
