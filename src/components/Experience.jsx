import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Line, Float, QuadraticBezierLine, useTexture, useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';
import Bug from './Bug';
import Floor from './Floor';

const PCB_BLUE = "#00ffff";
const PCB_PINK = "#ff0077";
const PCB_GOLD = "#ffd700";

// Consolidated Neural Preview Database
const PREVIEW_DATA = {
    // VEROE.FUN CLUSTER
    'f_escosigns': '/uploaded_image_0_1767873499613.png',
    'f_spoti': '/uploaded_image_1_1767873499613.png',
    'f_tnt': '/uploaded_image_2_1767873499613.png',
    'f_fight': '/uploaded_image_3_1767873499613.png',
    'f_more': '/uploaded_image_4_1767873499613.png',

    // VELARIXSOLUTIONS.NL CLUSTER
    'v_root': '/uploaded_image_0_1767876226767.png',
    'v_404': '/uploaded_image_1_1767876226767.png',
    'v_crypto': '/uploaded_image_2_1767876226767.png',
    'v_find': '/uploaded_image_3_1767876226767.png',
    'v_inlet': '/uploaded_image_4_1767876226767.png',

    // DATA SHARDS
    's_root': '/quietembed.mp4'
};

// Optimized Non-Blocking Texture Loader
const VideoFeed = ({ url }) => {
    const videoTexture = useVideoTexture(url, {
        unsuspended: 'canplay',
        muted: true,
        loop: true,
        start: true
    });
    return (
        <mesh>
            <planeGeometry args={[13.6, 7]} />
            <meshBasicMaterial map={videoTexture} transparent={false} />
        </mesh>
    );
};

const ImageFeed = ({ url }) => {
    const [texture, setTexture] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loader = new THREE.TextureLoader();
        loader.load(url, (tex) => {
            if (!isMounted) return;
            tex.colorSpace = THREE.SRGBColorSpace;
            setTexture(tex);
        }, undefined, () => { if (isMounted) setError(true); });
        return () => { isMounted = false; if (texture) texture.dispose(); };
    }, [url]);

    if (error) return <Text fontSize={0.3} color="#ff3333">FEED_SYNC_ERROR</Text>;
    if (!texture) return <Text fontSize={0.3} color="#00ffff" opacity={0.6}>SYNCING_FEED...</Text>;

    return (
        <mesh>
            <planeGeometry args={[13.6, 7]} />
            <meshBasicMaterial map={texture} transparent={false} />
        </mesh>
    );
};

const PreviewMedia = ({ url }) => {
    const isVideo = url.endsWith('.mp4');
    return (
        <group position={[0, -0.25, 0.16]}>
            <mesh>
                <planeGeometry args={[13.6, 7]} />
                <meshBasicMaterial color="#000" transparent opacity={0.6} />
            </mesh>
            {isVideo ? <VideoFeed url={url} /> : <ImageFeed url={url} />}
        </group>
    );
};

const PreviewWindow = ({ node, isVisible, trunkColor }) => {
    const groupRef = useRef();
    const [scale, setScale] = useState(0);
    const hasMedia = !!PREVIEW_DATA[node.id];

    useFrame(() => {
        const target = isVisible ? 1 : 0;
        setScale(THREE.MathUtils.lerp(scale, target, 0.15));
        if (groupRef.current) {
            groupRef.current.scale.setScalar(scale);
            groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, isVisible ? 10 : 0, 0.15);
        }
    });

    if (scale < 0.01 && !isVisible) return null;

    const panelPos = [node.position[0] + 10, node.position[1], 5];

    return (
        <group position={panelPos} ref={groupRef}>
            <QuadraticBezierLine
                start={[-9, 0, -6]}
                end={[0, 0, 0]}
                mid={[-4.5, 2, -3]}
                color={trunkColor}
                lineWidth={3}
                transparent
                opacity={0.8 * scale}
            />

            {/* ULTRA OPTIMIZED PERFORMANCE FRAME */}
            <mesh>
                <boxGeometry args={[14, 8, 0.1]} />
                <meshPhongMaterial
                    color="#050510"
                    transparent
                    opacity={0.85}
                    shininess={100}
                    specular="#ffffff"
                />
            </mesh>

            <mesh position={[0, 3.6, 0.15]}>
                <planeGeometry args={[13.8, 0.6]} />
                <meshBasicMaterial color="#000" />
            </mesh>
            <Text position={[-6.5, 3.6, 0.17]} fontSize={0.18} color={trunkColor} anchorX="left">
                LINK_FEED: {(node?.url || 'system_node').replace('https://', '')}
            </Text>

            {hasMedia ? (
                <PreviewMedia url={PREVIEW_DATA[node.id]} />
            ) : (
                <Text position={[0, -0.25, 0.16]} fontSize={0.3} color="#444">NO_VIBE_FEED</Text>
            )}

            <mesh position={[0, 0, 0]} scale={[1.005, 1.005, 1.1]}>
                <boxGeometry args={[14, 8, 0.2]} />
                <meshBasicMaterial color={trunkColor} wireframe transparent opacity={0.4 * scale} />
            </mesh>

            <pointLight intensity={10} distance={15} color={trunkColor} />
        </group>
    );
};

const LaserPulse = ({ points, color }) => {
    const meshRef = useRef();
    const [curve] = useState(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))));

    useFrame((state) => {
        const t = (state.clock.elapsedTime * 0.5) % 1;
        const pos = curve.getPointAt(t);
        meshRef.current.position.copy(pos);
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color={color} />
            <pointLight intensity={20} distance={5} color={color} />
        </mesh>
    );
};

const NodeElement = ({ node, isActive, isDimmed, isDeploying, onVisit }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current) {
            const time = state.clock.elapsedTime;
            const targetScale = isDeploying ? 1 : 0;
            groupRef.current.scale.lerp(new THREE.Vector3().setScalar(targetScale), 0.1);
            const zTarget = isActive ? 5 : 0;
            groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, zTarget, 0.15);

            if (isActive) {
                const s = 1 + Math.sin(time * 4) * 0.05;
                groupRef.current.scale.set(s, s, s);
                groupRef.current.rotation.y = Math.sin(time * 2) * 0.1;
                groupRef.current.rotation.x = Math.cos(time * 2) * 0.05;
            }
        }
    });

    return (
        <group
            position={node.position}
            ref={groupRef}
            onClick={(e) => { e.stopPropagation(); if (node.url) onVisit(node.url); }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
            <Float speed={isActive ? 8 : 2} rotationIntensity={0.5} floatIntensity={1}>
                {/* Advanced Glass Module */}
                <mesh position={[0, 0, 0.1]}>
                    <boxGeometry args={[4.2, 1.2, 0.2]} />
                    <meshPhysicalMaterial
                        roughness={0.15}
                        transmission={0.5}
                        ior={1.1}
                        thickness={0.2}
                        color={isActive ? node.color || PCB_BLUE : "#050505"}
                        transparent
                        opacity={isDimmed ? 0.05 : 0.9}
                    />
                </mesh>

                <mesh position={[0, 0, 0.1]} scale={[1.05, 1.1, 1.2]}>
                    <boxGeometry args={[4.2, 1.2, 0.2]} />
                    <meshBasicMaterial
                        color={isActive ? "#fff" : node.color || "#333"}
                        wireframe
                        transparent
                        opacity={isDimmed ? 0.1 : 0.9}
                    />
                </mesh>

                {isActive && (
                    <mesh position={[0, 0, -0.1]} scale={[1.1, 1.1, 1.1]}>
                        <planeGeometry args={[4.2, 1.2]} />
                        <meshBasicMaterial color={node.color} transparent opacity={0.2} />
                    </mesh>
                )}

                <Text position={[0, 0.2, 0.4]} fontSize={0.35} fontWeight="black" color="#fff">
                    {node.label}
                </Text>

                <Text position={[0, -0.3, 0.4]} fontSize={0.12} color={isActive ? "#fff" : node.color || "#444"} letterSpacing={0.4}>
                    {node.sub}
                </Text>

                {isActive && <pointLight intensity={20} distance={10} color={node.color || PCB_BLUE} />}
            </Float>
        </group>
    );
};

const TREE_DATA = {
    root: [
        { id: 'velarix', position: [-12, 10, 0], label: 'VELARIXSOLUTIONS.NL', sub: 'NETWORK_PRIMARY', color: PCB_BLUE },
        { id: 'veroe_fun', position: [0, 10, 0], label: 'VEROE.FUN', sub: 'NETWORK_HUB', color: PCB_PINK },
        { id: 'veroe_space', position: [12, 10, 0], label: 'QUIETBIN.SPACE', sub: 'DATA_SHARD', color: PCB_GOLD },
    ],
    velarix: [
        { id: 'v_root', position: [-12, 6, 0], label: 'MAIN_ROOT', sub: 'velarixsolutions.nl', url: 'https://velarixsolutions.nl', trunkId: 'velarix' },
        { id: 'v_404', position: [-12, 3, 0], label: '404', sub: 'ERR_GATE', url: 'https://404.velarixsolutions.nl', trunkId: 'velarix' },
        { id: 'v_crypto', position: [-12, 0, 0], label: 'CRYPTO', sub: 'HASH_LINK', url: 'https://crypto.velarixsolutions.nl', trunkId: 'velarix' },
        { id: 'v_find', position: [-12, -3, 0], label: 'FIND', sub: 'QUERY_NODE', url: 'https://find.velarixsolutions.nl', trunkId: 'velarix' },
        { id: 'v_inlet', position: [-12, -6, 0], label: 'INLET', sub: 'ENTRY_PORT', url: 'https://inlet.velarixsolutions.nl', trunkId: 'velarix' },
    ],
    veroe_fun: [
        { id: 'f_escosigns', position: [0, 6, 0], label: 'ESCOSIGNS', sub: 'GFX_HUB', url: 'https://escosigns.veroe.fun', trunkId: 'veroe_fun' },
        { id: 'f_spoti', position: [0, 3, 0], label: 'SPOTI', sub: 'AUDIO_STREAM', url: 'https://spoti.veroe.fun', trunkId: 'veroe_fun' },
        { id: 'f_tnt', position: [0, 0, 0], label: 'TNT', sub: 'DYNAMO_CORE', url: 'https://tnt.veroe.fun', trunkId: 'veroe_fun' },
        { id: 'f_fight', position: [0, -3, 0], label: 'FIGHT', sub: 'BATTLE_ROOM', url: 'https://fight.veroe.fun', trunkId: 'veroe_fun' },
        { id: 'f_more', position: [0, -6, 0], label: 'MORE', sub: 'EXTRA_DATA', url: 'https://more.veroe.fun', trunkId: 'veroe_fun' },
    ],
    veroe_space: [
        { id: 's_root', position: [12, 6, 0], label: 'QUIETBIN.SPACE', sub: 'VEROE_SHRAPNEL', url: 'https://veroe.space', trunkId: 'veroe_space' },
    ]
};

const Experience = ({ onNodeActive, isCentering, onCenterComplete }) => {
    const [currentMenu, setCurrentMenu] = useState('root');
    const [currentNodeIdx, setCurrentNodeIdx] = useState(0);
    const [previewActive, setPreviewActive] = useState(false);

    const activeNodes = TREE_DATA[currentMenu];
    const bugCurrentPos = useRef(new THREE.Vector3(...activeNodes[0].position));

    useEffect(() => {
        if (onNodeActive && activeNodes[0]) onNodeActive(activeNodes[0]);
    }, []);

    useFrame((state) => {
        if (!activeNodes || !activeNodes[currentNodeIdx]) return;
        const targetNode = activeNodes[currentNodeIdx];
        bugCurrentPos.current.lerp(new THREE.Vector3(...targetNode.position), 0.2);

        // Smooth camera flow - pull back more when preview is active
        let camTargetZ = currentMenu === 'root' ? 45 : 35;
        if (previewActive) camTargetZ = 50;

        let camTargetX = currentMenu === 'root' ? 0 : targetNode.position[0] * 0.5;
        if (previewActive) camTargetX = targetNode.position[0] + 4; // Shift camera to see preview better

        const camTargetY = currentMenu === 'root' ? 0 : targetNode.position[1];

        state.camera.position.lerp(new THREE.Vector3(camTargetX, camTargetY, camTargetZ), 0.08);
        state.camera.lookAt(bugCurrentPos.current.x * 0.2, bugCurrentPos.current.y * 0.2, 0);

        if (isCentering) {
            state.camera.position.lerp(new THREE.Vector3(0, 0, 45), 0.1);
            if (state.camera.position.z >= 44.9) onCenterComplete();
        }
    });

    const handleVisit = (url) => { window.open(url, '_blank'); };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            let nextIdx = currentNodeIdx;

            if (key === 'enter') {
                const selected = activeNodes[currentNodeIdx];
                if (TREE_DATA[selected.id]) {
                    setCurrentMenu(selected.id);
                    setCurrentNodeIdx(0);
                    setPreviewActive(false);
                } else if (selected.url) {
                    if (!previewActive) {
                        setPreviewActive(true); // First enter: deploy preview
                    } else {
                        handleVisit(selected.url); // Second enter: open site
                    }
                }
                return;
            }

            if (currentMenu === 'root') {
                if (key === 'a' || key === 'arrowleft') nextIdx = (currentNodeIdx - 1 + activeNodes.length) % activeNodes.length;
                else if (key === 'd' || key === 'arrowright') nextIdx = (currentNodeIdx + 1) % activeNodes.length;
                else if (key === 's' || key === 'arrowdown') {
                    const selected = activeNodes[currentNodeIdx];
                    if (TREE_DATA[selected.id]) {
                        setCurrentMenu(selected.id);
                        setCurrentNodeIdx(0);
                    }
                }
            } else {
                if (key === 'w' || key === 'arrowup') {
                    setPreviewActive(false);
                    if (currentNodeIdx > 0) nextIdx = currentNodeIdx - 1;
                    else {
                        setCurrentMenu('root');
                        setCurrentNodeIdx(TREE_DATA.root.findIndex(n => n.id === currentMenu));
                        return;
                    }
                } else if (key === 's' || key === 'arrowdown') {
                    setPreviewActive(false);
                    if (currentNodeIdx < activeNodes.length - 1) nextIdx = currentNodeIdx + 1;
                } else if (key === 'escape' || key === 'a' || key === 'd') {
                    setPreviewActive(false);
                    setCurrentMenu('root');
                    setCurrentNodeIdx(TREE_DATA.root.findIndex(n => n.id === currentMenu));
                    return;
                }
            }

            if (nextIdx !== currentNodeIdx) {
                setCurrentNodeIdx(nextIdx);
                if (onNodeActive) onNodeActive(activeNodes[nextIdx]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentNodeIdx, currentMenu, activeNodes, previewActive]);

    const trunkColor = TREE_DATA.root.find(n => n.id === currentMenu)?.color || PCB_BLUE;

    return (
        <group>
            <Floor />

            {['velarix', 'veroe_fun', 'veroe_space'].map((id) => {
                const trunkNode = TREE_DATA.root.find(n => n.id === id);
                const top = trunkNode.position;
                const bottom = [top[0], -20, 0];
                return (
                    <group key={id}>
                        <Line points={[top, bottom]} color={trunkNode.color} lineWidth={1} transparent opacity={0.1} />
                        <LaserPulse points={[top, [top[0], 0, 0], bottom]} color={trunkNode.color} />
                    </group>
                );
            })}

            {Object.entries(TREE_DATA).map(([key, nodes]) => {
                return nodes.map((node, i) => {
                    const matchesActiveMenu = key === currentMenu;
                    const isSelected = matchesActiveMenu && activeNodes[currentNodeIdx].id === node.id;
                    const isRoot = key === 'root';
                    const isVisibleChild = key === currentMenu;

                    if (!isRoot && !isVisibleChild) return null;

                    return (
                        <group key={node.id}>
                            <NodeElement
                                node={node}
                                isActive={isSelected}
                                isDimmed={!matchesActiveMenu && !isRoot}
                                isDeploying={isVisibleChild || isRoot}
                                onVisit={() => {
                                    if (isSelected && !previewActive) setPreviewActive(true);
                                    else if (isSelected && previewActive) handleVisit(node.url);
                                    else if (!isSelected) {
                                        setCurrentNodeIdx(i);
                                        setPreviewActive(true);
                                        if (onNodeActive) onNodeActive(node);
                                    }
                                }}
                            />
                            {isSelected && node.url && (
                                <PreviewWindow node={node} isVisible={previewActive} trunkColor={trunkColor} />
                            )}
                        </group>
                    );
                });
            })}

            <Bug currentPosition={bugCurrentPos.current} />
        </group>
    );
};

export default Experience;
