import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const RagingSeaMaterial = shaderMaterial(
  {
    uTime: 0,
    uDepthColor: new THREE.Color('#000000'),
    uSurfaceColor: new THREE.Color('#004466'),
    uScale: 3.0,
    uSpeed: 0.3,
    uColorMultiplier: 2.0,
    uColorOffset: 0.1
  },
  // Vertex Shader - Simple pass-through mostly
  `
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vUv = uv;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * viewMatrix * modelPosition;
    }
  `,
  // Fragment Shader - Plasma / Liquid Smoke Logic
  `
    uniform float uTime;
    uniform vec3 uDepthColor;
    uniform vec3 uSurfaceColor;
    uniform float uScale;
    uniform float uSpeed;
    uniform float uColorMultiplier;
    uniform float uColorOffset;

    varying vec2 vUv;

    void main() {
      // Scale UVs
      vec2 uv = vUv * uScale;
      float time = uTime * uSpeed;

      // 1. Create organic movement by summing sine waves at different angles
      // This creates interference patterns (Moire/Plasma) which look like liquid but never grid-like
      float strength = 0.0;
      strength += sin(uv.x * 3.0 + time) * 0.5;
      strength += sin(uv.y * 2.5 + time * 0.8) * 0.5;
      strength += sin((uv.x + uv.y) * 2.0 - time * 1.5) * 0.5;
      
      // 2. Add swirling distortion based on distance from center
      strength += sin(length(uv - 0.5) * 5.0 + time);

      // 3. Normalize roughly to 0-1
      strength = (strength + 2.0) * 0.25;

      // 4. Mix Colors
      float mixStrength = (strength + uColorOffset) * uColorMultiplier;
      mixStrength = clamp(mixStrength, 0.0, 1.0);

      vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ RagingSeaMaterial });

const RagingSea = () => {
  const materialRef = useRef();

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
    }
  });

  return (
    <mesh rotation={[0, 0, 0]} position={[0, 0, -30]} scale={2}>
      {/* Low vertex count needed for frag shader - using 2x2 is fine */}
      <planeGeometry args={[100, 80, 2, 2]} />
      <ragingSeaMaterial
        ref={materialRef}
        key={RagingSeaMaterial.key}
        uDepthColor={new THREE.Color('#000000')}
        uSurfaceColor={new THREE.Color('#003355')} // Deep classy blue
        uScale={4.0}
        uSpeed={0.2}
        uColorMultiplier={2.5}
        uColorOffset={0.05}
      />
    </mesh>
  );
};

export default RagingSea;
