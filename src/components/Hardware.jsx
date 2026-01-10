
import React, { useRef, useLayoutEffect } from 'react';
import { useGLTF, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// A procedural "Server Blade" component to simulate real hardware
// If you have a .glb file, you would use:
// const { nodes, materials } = useGLTF('/path/to/model.glb')

export const ServerBlade = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, delay = 0 }) => {
    const groupRef = useRef();

    useLayoutEffect(() => {
        if (!groupRef.current) return;

        // Initial State
        const originalPos = new THREE.Vector3(...position);

        // Start far away or tiny
        groupRef.current.position.set(originalPos.x, originalPos.y + 20, originalPos.z - 50);
        groupRef.current.scale.set(0, 0, 0);
        groupRef.current.rotation.set(rotation[0] + Math.PI, rotation[1] + Math.PI, rotation[2]);

        // Animate in "Fly-in"
        const tl = gsap.timeline({ delay: delay });

        tl.to(groupRef.current.position, {
            x: originalPos.x,
            y: originalPos.y,
            z: originalPos.z,
            duration: 1.5,
            ease: "power3.out"
        })
            .to(groupRef.current.scale, {
                x: scale,
                y: scale,
                z: scale,
                duration: 1.2,
                ease: "back.out(1.7)"
            }, "<")
            .to(groupRef.current.rotation, {
                x: rotation[0],
                y: rotation[1],
                z: rotation[2],
                duration: 1.5,
                ease: "power3.out"
            }, "<");

        // 10-Second Interval Refresh Animation (Subtle "Re-boot" check)
        const interval = setInterval(() => {
            if (groupRef.current) {
                gsap.to(groupRef.current.scale, {
                    x: scale * 1.1,
                    y: scale * 1.1,
                    z: scale * 1.1,
                    yoyo: true,
                    repeat: 1,
                    duration: 0.2,
                    ease: "power2.inOut"
                });
            }
        }, 10000); // 10s interval

        return () => clearInterval(interval);

    }, [position, rotation, scale, delay]);

    return (
        <group ref={groupRef}>
            {/* Main Chassis */}
            <RoundedBox args={[4, 1, 8]} radius={0.1} smoothness={4}>
                <meshPhysicalMaterial
                    color="#1a1a1a"
                    metalness={0.8}
                    roughness={0.2}
                    clearcoat={1}
                />
            </RoundedBox>

            {/* Front Panel Lights */}
            <group position={[0, 0, 4.05]}>
                <mesh position={[-1.5, 0, 0]}>
                    <planeGeometry args={[0.5, 0.5]} />
                    <meshBasicMaterial color="#00ff00" toneMapped={false} />
                    <pointLight distance={2} intensity={2} color="#00ff00" />
                </mesh>
                <mesh position={[-0.8, 0, 0]}>
                    <planeGeometry args={[0.2, 0.2]} />
                    <meshBasicMaterial color="red" toneMapped={false} />
                </mesh>
            </group>

            {/* Gold Connectors */}
            <mesh position={[0, -0.6, 0]}>
                <boxGeometry args={[3.8, 0.2, 7]} />
                <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
            </mesh>

            {/* Top Heatsink Fins */}
            <group position={[0, 0.6, 0]}>
                {Array.from({ length: 10 }).map((_, i) => (
                    <mesh key={i} position={[0, 0, (i - 4.5) * 0.6]}>
                        <boxGeometry args={[3.5, 0.4, 0.1]} />
                        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

export default ServerBlade;
