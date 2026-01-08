import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Html, Preload } from '@react-three/drei';
import Experience from './components/Experience';
import Terminal from './components/Terminal';
import LoadingScreen from './components/LoadingScreen';
import { trackPageView } from './utils/analytics';
import './index.css';

const Header = () => (
  <header className="site-header">
    <div className="logo glitch-text" data-text="ESCO.IO">ESCO.IO</div>
    <div className="system-status">
      <span className="status-bit pulse">NEURAL_LINK_ESTABLISHED</span>
      <span className="status-bit">CORE_v1.8.0</span>
    </div>
  </header>
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

      <Header />

      <div className="canvas-container">
        <Canvas
          gl={{
            antialias: false,
            powerPreference: "default",
            alpha: false,
            depth: true,
            stencil: false,
            failIfMajorPerformanceCaveat: false
          }}
          dpr={[1, 1.5]} // Cap DPI to ensure stability
          camera={{ position: [0, 0, 35], fov: 40 }}
        >
          <color attach="background" args={['#000103']} />

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
