import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';

const Bug = ({ currentPosition }) => {
    const meshRef = useRef();
    const ringRef1 = useRef();
    const ringRef2 = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.lerp(currentPosition, 0.1);
            const time = state.clock.elapsedTime;

            ringRef1.current.rotation.x = time * 2;
            ringRef1.current.rotation.y = time * 1.5;

            ringRef2.current.rotation.y = time * -2;
            ringRef2.current.rotation.z = time * 1.2;
        }
    });

    return (
        <group ref={meshRef}>
            <Float speed={5} rotationIntensity={2} floatIntensity={1}>
                {/* The Core Energy diamond */}
                <mesh scale={[0.4, 0.6, 0.4]}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh scale={[0.45, 0.65, 0.45]}>
                    <octahedronGeometry args={[1, 0]} />
                    <MeshDistortMaterial
                        color="#00ffff"
                        emissive="#00ffff"
                        emissiveIntensity={10}
                        speed={4}
                        distort={0.4}
                    />
                </mesh>

                {/* Spinning Orbit Rings */}
                <mesh ref={ringRef1}>
                    <torusGeometry args={[0.8, 0.02, 16, 100]} />
                    <meshBasicMaterial color="#ff0077" />
                </mesh>
                <mesh ref={ringRef2}>
                    <torusGeometry args={[1.1, 0.015, 16, 100]} />
                    <meshBasicMaterial color="#00ffff" />
                </mesh>

                <pointLight intensity={20} distance={5} color="#00ffff" />
            </Float>
        </group>
    );
};

export default Bug;
