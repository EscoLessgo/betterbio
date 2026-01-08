import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// 🧊 SANITY CUBE: If this renders, WebGL works.
const Cube = () => {
  const mesh = useRef();
  useFrame((state, delta) => (mesh.current.rotation.x = mesh.current.rotation.y += delta));
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color="red" wireframe />
    </mesh>
  );
};

function App() {
  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, color: '#0f0', zIndex: 10, fontFamily: 'monospace' }}>
        DEBUG_MODE: SANITY_CHECK
      </div>
      <Canvas
        gl={{
          antialias: false,
          alpha: false,
          depth: false, // ⚠️ DATA SAVER: Disable depth buffer to save memory
          stencil: false,
          powerPreference: "low-power"
        }}
        dpr={1}
        camera={{ position: [0, 0, 5], fov: 50 }}
      >
        <color attach="background" args={['#111']} />
        <Cube />
      </Canvas>
    </div>
  );
}

export default App;
