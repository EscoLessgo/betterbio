import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
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
    <div className="key-uigroup">
      <div className="key-cluster">
        <div className="key-row">
          <span className="key-cap">W</span>
        </div>
        <div className="key-row">
          <span className="key-cap">A</span>
          <span className="key-cap">S</span>
          <span className="key-cap">D</span>
        </div>
      </div>

      {/* Decorative connection line */}
      <div className="key-connect">
        <svg width="40" height="20" viewBox="0 0 40 20">
          <path d="M0,10 L40,10" stroke="var(--accent-cyan)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="20" cy="10" r="2" fill="var(--accent-pink)" />
        </svg>
      </div>

      <div className="key-action">
        <span className="key-cap wide">ENTER ↵</span>
      </div>
    </div>
    <div className="instruction-text" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
      NAVIGATION_SYSTEM
    </div>
  </div>
);

function App() {
  const [activeView, setActiveView] = useState(null);
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

    // Meta Theme Color Setup
    let metaTheme = document.querySelector("meta[name='theme-color']");
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }

    let frame = 0;
    let titleSwapTimer = 0;
    let useCrazyTitle = false;

    const interval = setInterval(() => {
      frame++;
      titleSwapTimer++;

      // 1. FLASHING RAINBOW BROWSER THEME
      // Cycle through HSL for smooth but fast rainbow effect
      // speed: 10 degrees per frame
      const hue = (frame * 15) % 360;
      const rainbowColor = `hsl(${hue}, 100%, 50%)`;
      metaTheme.content = rainbowColor;

      // 2. HYPER GLITCH TITLE
      if (titleSwapTimer > 30) { // Every ~2.4s (30 * 80ms)
        useCrazyTitle = !useCrazyTitle;
        titleSwapTimer = 0;
      }

      const currentBase = useCrazyTitle ? "ESCO IS CRAZY" : "ESCO.IO";

      // Glitch Intensity: 40% chance of full chaos, otherwise just shaky case
      if (Math.random() > 0.6) {
        // CHAOS MODE
        const glitchChars = "$%#@&!*?^~";
        const glitched = currentBase.split('').map(c => {
          if (c === ' ') return ' '; // preserve spaces essentially
          return Math.random() > 0.5 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : c;
        }).join('');
        document.title = glitched;
      } else {
        // SHAKY CASE MODE
        const shaky = currentBase.split('').map(c => Math.random() > 0.5 ? c.toLowerCase() : c.toUpperCase()).join('');
        document.title = shaky;
      }

      // 3. Color Pulse Favicon (Synced with Rainbow)
      ctx.clearRect(0, 0, 32, 32);
      ctx.fillStyle = rainbowColor; // Sync favicon background with theme color
      ctx.fillRect(0, 0, 32, 32);

      ctx.font = 'bold 20px "Courier New"';
      ctx.fillStyle = '#000000'; // Text black for contrast
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentBase[0], 16, 16);

      link.href = canvas.toDataURL('image/png');

    }, 80); // 12.5 FPS for that rugged retro feel

    return () => clearInterval(interval);
  }, []);

  const handleNodeActive = (node) => {
    if (!node) return;
    setActiveView(node);
    trackPageView(`/node/${node.id || 'unknown'}`);
  };

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
