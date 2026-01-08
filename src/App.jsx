import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Html, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
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
    setActiveView(node);
    setShowTerminal(true);
    trackPageView(`/node/${node.id}`);
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
            powerPreference: "high-performance",
            alpha: false,
            stencil: false,
            depth: true
          }}
          camera={{ position: [0, 0, 35], fov: 40 }}
        >
          <color attach="background" args={['#000103']} />

          {!isLoading && (
            <Experience
              onNodeActive={handleNodeActive}
              activeView={activeView}
              isCentering={isCentering}
              onCenterComplete={() => setIsCentering(false)}
            />
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

          <ambientLight intensity={0.1} />
          <spotLight position={[20, 30, 20]} angle={0.2} penumbra={1} intensity={10} color="#00ffff" castShadow />
          <pointLight position={[-20, 20, 10]} intensity={15} color="#ff0077" />
          <pointLight position={[20, -20, 10]} intensity={10} color="#00ffff" />

          <Stars radius={150} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />

          <Preload all />
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
