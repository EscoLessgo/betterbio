import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Line, Float, QuadraticBezierLine, useTexture, useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';

const {
    Vector3,
    MathUtils,
    CatmullRomCurve3,
    TextureLoader,
    SRGBColorSpace
} = THREE;
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

// Robust Video Feed using manual element
const VideoFeed = ({ url }) => {
    const [video] = useState(() => {
        const vid = document.createElement('video');
        vid.src = url;
        vid.crossOrigin = 'Anonymous';
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.autoplay = true;
        return vid;
    });

    useEffect(() => {
        video.play().catch(e => console.warn("Autoplay failed", e));
        return () => video.pause();
    }, [video]);

    return (
        <mesh scale={[1, -1, 1]}> {/* Fix texture flip */}
            <planeGeometry args={[13.6, 7]} />
            <meshBasicMaterial>
                <videoTexture attach="map" args={[video]} encoding={THREE.SRGBColorSpace} />
            </meshBasicMaterial>
        </mesh>
    );
};

const ImageFeed = ({ url }) => {
    const texture = useTexture(url);
    texture.colorSpace = SRGBColorSpace;
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
        setScale(MathUtils.lerp(scale, target, 0.15));
        if (groupRef.current) {
            groupRef.current.scale.setScalar(scale);
            groupRef.current.position.z = MathUtils.lerp(groupRef.current.position.z, isVisible ? 10 : 0, 0.15);
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
    const [curve] = useState(() => new CatmullRomCurve3(points.map(p => new Vector3(...p))));

    useFrame((state) => {
        const t = (state.clock.elapsedTime * 0.5) % 1;
        const pos = curve.getPointAt(t);
        if (meshRef.current) meshRef.current.position.copy(pos);
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
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (groupRef.current) {
            const time = state.clock.elapsedTime;
            const targetScale = isDeploying ? 1 : 0;
            const hoverScale = hovered ? 1.1 : 1.0;

            // Smooth deployment and hover scaling
            groupRef.current.scale.lerp(new Vector3().setScalar(targetScale * hoverScale), 0.1);

            const zTarget = isActive ? 8 : 0; // Pop out more when active
            groupRef.current.position.z = MathUtils.lerp(groupRef.current.position.z, zTarget, 0.1);

            if (isActive || hovered) {
                // Subtle breathing
                groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
                groupRef.current.rotation.x = Math.cos(time * 0.5) * 0.05;
            } else {
                // Reset rotation
                groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1);
                groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
            }
        }
    });

    const isHighlight = isActive || hovered;

    return (
        <group
            position={node.position}
            ref={groupRef}
            onClick={(e) => { e.stopPropagation(); if (node.url) onVisit(node.url); }}
            onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
            <Float speed={isActive ? 4 : 2} rotationIntensity={0.2} floatIntensity={0.5}>
                {/* Clean Glass Panel */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[6, 1.8, 0.2]} />
                    <meshPhysicalMaterial
                        color={isHighlight ? node.color : "#111"}
                        roughness={0.2}
                        metalness={0.8}
                        transmission={0.6}
                        thickness={0.5}
                        transparent
                        opacity={isHighlight ? 0.9 : 0.6} // Dim when idle
                    />
                </mesh>

                {/* Brighter Border - Always visible but brighter on active */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[6.05, 1.85, 0.21]} />
                    <meshBasicMaterial
                        color={isHighlight ? node.color : "#444"}
                        wireframe
                        transparent
                        opacity={isHighlight ? 1.0 : 0.3}
                    />
                </mesh>

                {/* Main Label - Lowercase & Minimal */}
                <Text
                    position={[0, 0, 0.22]}
                    fontSize={0.55}
                    fontWeight="bold"
                    color={isHighlight ? "#fff" : "#aaa"}
                    anchorX="center"
                    anchorY="middle"
                >
                    {node.label.toLowerCase()}
                </Text>

                {/* Active Glow Emitter */}
                {isHighlight && (
                    <pointLight intensity={8} distance={6} color={node.color} position={[0, 0, 1]} />
                )}
            </Float>
        </group>
    );
};

const TREE_DATA = {
    root: [
        { id: 'velarix', position: [-18, 2, 0], label: 'VELARIX', sub: 'SOLUTIONS', color: PCB_BLUE, scale: 1 },
        { id: 'veroe_fun', position: [0, 4, 2], label: 'ESCO.IO', sub: 'MAIN_HUB', color: PCB_PINK, scale: 1.5 }, // HERO NODE
        { id: 'veroe_space', position: [18, 2, 0], label: 'QUIETBIN', sub: 'ARCHIVE', color: PCB_GOLD, scale: 1 },
    ],
    velarix: [
        { id: 'v_root', position: [-18, -3, 0], label: 'MAIN SITE', sub: 'velarixsolutions.nl', url: 'https://velarixsolutions.nl', trunkId: 'velarix' },
        { id: 'v_crypto', position: [-18, -6, 0], label: 'CRYPTO', sub: 'WEB3_NODES', url: 'https://crypto.velarixsolutions.nl', trunkId: 'velarix' },
        { id: 'v_find', position: [-18, -9, 0], label: 'FIND', sub: 'SEARCH_ENGINE', url: 'https://find.velarixsolutions.nl', trunkId: 'velarix' },
    ],
    veroe_fun: [
        { id: 'f_escosigns', position: [0, -2, 0], label: 'ESCOSIGNS', sub: 'DESIGN_PORTFOLIO', url: 'https://escosigns.veroe.fun', trunkId: 'veroe_fun' },
        { id: 'f_spoti', position: [0, -5, 0], label: 'SPOTI_CLONE', sub: 'REQ_AUTH', url: 'https://spoti.veroe.fun', trunkId: 'veroe_fun' },
        { id: 'f_tnt', position: [0, -8, 0], label: 'TNT_CORE', sub: 'MINECRAFT_MW', url: 'https://tnt.veroe.fun', trunkId: 'veroe_fun' },
        { id: 'f_fight', position: [0, -11, 0], label: 'FIGHT_CLUB', sub: 'INTERACTIVE', url: 'https://fight.veroe.fun', trunkId: 'veroe_fun' },
    ],
    veroe_space: [
        { id: 's_root', position: [18, -3, 0], label: 'DATA_SHARD', sub: 'veroe.space', url: 'https://veroe.space', trunkId: 'veroe_space' },
    ]
};

const ConnectionRail = ({ start, end, color }) => {
    return (
        <group>
            {/* Vertical Drop Line */}
            <Line
                points={[start, [start[0], end[1], start[2]], end]}
                color={color}
                lineWidth={2}
                transparent
                opacity={0.3}
            />
            {/* Glowing Emitter at Start */}
            <mesh position={start}>
                <sphereGeometry args={[0.15]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </group>
    );
};

const Experience = ({ onNodeActive, isCentering, onCenterComplete }) => {
    const [currentMenu, setCurrentMenu] = useState('root');
    const [currentNodeIdx, setCurrentNodeIdx] = useState(0);
    const [previewActive, setPreviewActive] = useState(false);

    const activeNodes = TREE_DATA[currentMenu];
    const bugCurrentPos = useRef(new Vector3(...activeNodes[0].position));

    useEffect(() => {
        if (onNodeActive && activeNodes[0]) onNodeActive(activeNodes[0]);
    }, []);

    // Camera Rig State
    const camRig = useRef({
        pos: new Vector3(0, 0, 50),
        target: new Vector3(0, 0, 0)
    });

    useFrame((state, delta) => {
        // Safe check
        if (!activeNodes || !activeNodes[currentNodeIdx]) return;
        const targetNode = activeNodes[currentNodeIdx];

        // 1. Determine Desired Camera Position
        const isRoot = currentMenu === 'root';
        const isPreview = previewActive;

        // Base Z depth
        let targetZ = isRoot ? 55 : 40;
        if (isPreview) targetZ = 30; // Closer for preview

        // X/Y follows the node slightly, but mostly stays centered on the column/row
        let targetX = 0;
        let targetY = 0;

        if (isRoot) {
            targetX = 0;
            targetY = 0;
        } else {
            // If in submenu, center on the column parent
            const parent = TREE_DATA.root.find(n => n.id === currentMenu);
            if (parent) targetX = parent.position[0];
            targetY = targetNode.position[1];
        }

        // Shift for Preview Panel
        if (isPreview) targetX += 8;

        // 2. Smoothly Interpolate Rig State (The "Cinematic" feel)
        // Lower factor = smoother, heavier feel. Delta ensures framerate independence.
        const dampFactor = 2.0 * delta;

        camRig.current.pos.lerp(new Vector3(targetX, targetY, targetZ), dampFactor);

        // Look Target Logic
        let lookX = targetX;
        let lookY = targetY;
        // If preview, look slightly between node and panel
        if (isPreview) lookX -= 4;

        camRig.current.target.lerp(new Vector3(lookX, lookY, 0), dampFactor);

        // 3. Apply to Camera
        if (isCentering) {
            // Override for opening sequence
            state.camera.position.lerp(new Vector3(0, 0, 50), 0.05);
            state.camera.lookAt(0, 0, 0);
            if (state.camera.position.z >= 49.5) onCenterComplete();
        } else {
            state.camera.position.copy(camRig.current.pos);
            state.camera.lookAt(camRig.current.target);
        }

        // Update Bug separately
        bugCurrentPos.current.lerp(new Vector3(...targetNode.position), dampFactor * 2);
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

            // Navigation Logic... (Simplified for Grid)
            if (key === 'w' || key === 'arrowup') {
                if (currentNodeIdx > 0) nextIdx--;
                else if (currentMenu !== 'root') {
                    // Back to root
                    setCurrentMenu('root');
                    setCurrentNodeIdx(TREE_DATA.root.findIndex(n => n.id === currentMenu));
                    return;
                }
            } else if (key === 's' || key === 'arrowdown') {
                if (currentNodeIdx < activeNodes.length - 1) nextIdx++;
                else if (currentMenu === 'root') {
                    // Enter selected column
                    const selected = activeNodes[currentNodeIdx];
                    if (TREE_DATA[selected.id]) {
                        setCurrentMenu(selected.id);
                        setCurrentNodeIdx(0);
                        return;
                    }
                }
            } else if (key === 'a' || key === 'arrowleft') {
                if (currentMenu === 'root') nextIdx = (currentNodeIdx - 1 + activeNodes.length) % activeNodes.length;
                else {
                    // Back to root
                    setCurrentMenu('root');
                    setCurrentNodeIdx(TREE_DATA.root.findIndex(n => n.id === currentMenu));
                    return;
                }
            } else if (key === 'd' || key === 'arrowright') {
                if (currentMenu === 'root') nextIdx = (currentNodeIdx + 1) % activeNodes.length;
            } else if (key === 'escape') {
                setCurrentMenu('root');
                setPreviewActive(false);
                return;
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

            {/* Render Static Layout Connections */}
            {TREE_DATA.root.map(rootNode => {
                const children = TREE_DATA[rootNode.id];
                if (!children) return null;
                return children.map(child => (
                    <ConnectionRail
                        key={`${rootNode.id}-${child.id}`}
                        start={rootNode.position}
                        end={child.position}
                        color={rootNode.color}
                    />
                ));
            })}

            {/* Render Nodes */}
            {Object.entries(TREE_DATA).map(([key, nodes]) => {
                return nodes.map((node, i) => {
                    // Always render root nodes. Render children only if their menu is active OR we are in root (partially visible)
                    const isRoot = key === 'root';
                    const isChildOfActive = key === currentMenu;

                    // Improved Visibility Logic:
                    // Roots always visible.
                    // Children visible if their parent is selected.
                    const isVisible = isRoot || isChildOfActive;

                    // Selection Logic
                    const isSelected = isChildOfActive && i === currentNodeIdx;
                    // If in root menu, select the root node
                    const isRootSelected = currentMenu === 'root' && isRoot && i === currentNodeIdx;

                    const activeState = isSelected || isRootSelected;

                    // Opacity Logic
                    // If root menu: Roots are opaque, children scale 0
                    // If sub menu: Parent Root dim, Children opaque
                    let scale = node.scale || 1;
                    if (!isRoot && !isChildOfActive) scale = 0;

                    return (
                        <group key={node.id} scale={[scale, scale, scale]}>
                            <NodeElement
                                node={node}
                                isActive={activeState}
                                isDimmed={!activeState && isVisible}
                                isDeploying={isVisible}
                                onVisit={() => {
                                    // ... click logic
                                }}
                            />
                            {activeState && node.url && (
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
