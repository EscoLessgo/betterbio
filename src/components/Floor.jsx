import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, MeshReflectorMaterial, Line } from '@react-three/drei';

const PCB_BASE = "#020406";
const TRACE_COLOR = "#00ffff";

const CircuitTraces = () => {
    const traces = useMemo(() => {
        return Array.from({ length: 30 }).map(() => {
            const startX = (Math.random() - 0.5) * 60;
            const startY = (Math.random() - 0.5) * 60;
            const length = 5 + Math.random() * 15;
            const horizontal = Math.random() > 0.5;

            const points = [
                [startX, startY, -0.95],
                horizontal ? [startX + length, startY, -0.95] : [startX, startY + length, -1]
            ];
            return { points, color: Math.random() > 0.8 ? "#ff0077" : "#00ffff" };
        });
    }, []);

    return (
        <group>
            {traces.map((t, i) => (
                <Line
                    key={i}
                    points={t.points}
                    color={t.color}
                    lineWidth={1}
                    transparent
                    opacity={0.1}
                />
            ))}
        </group>
    );
};

const DataShard = ({ position, color, speed }) => {
    const ref = useRef();
    useFrame((state) => {
        if (ref.current) {
            ref.current.position.y += Math.sin(state.clock.elapsedTime * speed) * 0.01;
            ref.current.rotation.z += 0.01;
        }
    });
    return (
        <group position={position} ref={ref}>
            <mesh>
                <octahedronGeometry args={[0.2, 0]} />
                <meshBasicMaterial color={color} transparent opacity={0.4} />
            </mesh>
            <pointLight intensity={3} distance={4} color={color} />
        </group>
    );
};

const Floor = () => {
    const shrapnel = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            pos: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, Math.random() * 5],
            color: Math.random() > 0.5 ? "#00ffff" : "#ff0077",
            speed: 0.5 + Math.random()
        }));
    }, []);

    return (
        <group position={[0, 0, 0]}>
            {/* 1. HIGH-END REFLECTIVE OBSIDIAN FLOOR - ULTRA OPTIMIZED */}
            <mesh position={[0, 0, -1]} rotation={[0, 0, 0]}>
                <planeGeometry args={[200, 200]} />
                <MeshReflectorMaterial
                    blur={[50, 50]}
                    resolution={256}
                    mixBlur={0.5}
                    mixStrength={20}
                    roughness={1}
                    depthScale={1}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#050505"
                    metalness={0.5}
                    transparent
                    opacity={1}
                />
            </mesh>

            <CircuitTraces />

            {/* 3. BACKGROUND ARCHITECTURE - SIMPLIFIED */}
            <group position={[0, 0, -25]}>
                <mesh>
                    <icosahedronGeometry args={[40, 0]} />
                    <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.01} />
                </mesh>
            </group>

            {/* 4. DATA SHARDS - REDUCED COUNT */}
            {shrapnel.map((s, i) => (
                <DataShard key={i} position={s.pos} color={s.color} speed={s.speed} />
            ))}

            {/* 5. DISTANT NEURAL CORE */}
            <Sphere args={[1.2, 16, 16]} position={[0, 0, -15]}>
                <MeshDistortMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={2}
                    speed={1.5}
                    distort={0.2}
                />
            </Sphere>

            <pointLight position={[0, 0, 15]} intensity={15} color="#00ffff" distance={100} />
            <ambientLight intensity={0.2} />
        </group>
    );
};

export default Floor;
