import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Line, Float, QuadraticBezierLine, CubicBezierLine, Environment } from '@react-three/drei';
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
import ServerBlade from './Hardware';

const PCB_BLUE = "#2dfccc";
const PCB_PINK = "#d92b6b";
const PCB_GOLD = "#ffaa00";

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
    's_root': '/quietembed.mp4',

    // DISCORD GAMES
    'd_tenk': '/Ten-K.png',
    'd_square': '/square_up.png',
    'd_spell': '/spell-or-fail.png'
};

const VideoFeed = ({ url }) => {
    // Force re-creation of video element when URL changes
    const [video] = useState(() => document.createElement('video'));

    useEffect(() => {
        video.src = url;
        video.crossOrigin = 'Anonymous';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.load();

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => { }); // Ignore autoplay errors
        }
        return () => video.pause();
    }, [url, video]);

    return (
        <mesh scale={[1, 1, 1]}>
            <planeGeometry args={[13.6, 7]} />
            <meshBasicMaterial>
                <videoTexture attach="map" args={[video]} encoding={THREE.SRGBColorSpace} />
            </meshBasicMaterial>
        </mesh>
    );
};

const SafeImageFeed = ({ url }) => {
    const [texture, setTexture] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setError(false);
        setTexture(null);

        const loader = new TextureLoader();
        loader.load(
            url,
            (tex) => {
                if (!isMounted) return;
                try {
                    if (SRGBColorSpace) tex.colorSpace = SRGBColorSpace;
                } catch (e) {
                    console.warn("ColorSpace error ignored", e);
                }
                setTexture(tex);
            },
            undefined,
            (err) => {
                if (!isMounted) return;
                console.warn("Texture Load Failed:", url);
                setError(true);
            }
        );
        return () => { isMounted = false; };
    }, [url]);

    // Loading or Error State
    if (error || !texture) {
        return (
            <mesh>
                <planeGeometry args={[13.6, 7]} />
                <meshBasicMaterial color={error ? "#330000" : "#111"} transparent opacity={0.8} />
                {error && <Text fontSize={0.5} color="red" position={[0, 0, 0.1]}>IMG_ERR</Text>}
                {!error && <Text fontSize={0.5} color="#444" position={[0, 0, 0.1]}>LOADING...</Text>}
            </mesh>
        );
    }

    return (
        <mesh>
            <planeGeometry args={[13.6, 7]} />
            <meshBasicMaterial map={texture} transparent={false} />
        </mesh>
    );
};

const PreviewMedia = ({ url }) => {
    const isVideo = url && url.endsWith('.mp4');
    return (
        <group position={[0, -0.25, 0.16]}>
            <mesh>
                <planeGeometry args={[13.6, 7]} />
                <meshBasicMaterial color="#000" transparent opacity={0.6} />
            </mesh>
            {isVideo ? <VideoFeed url={url} /> : <SafeImageFeed url={url} />}
        </group>
    );
};

const PreviewWindow = ({ node, isVisible, trunkColor }) => {
    const { viewport } = useThree();
    const isMobile = viewport.aspect < 1;
    const groupRef = useRef();
    const [scale, setScale] = useState(0);
    const hasMedia = !!PREVIEW_DATA[node.id];

    useFrame((state, delta) => {
        const target = isVisible ? 1 : 0;
        // Smoother, fluid expansion using delta
        const lerpSpeed = 6.0 * delta; // Increased for snappier open
        setScale(MathUtils.lerp(scale, target, lerpSpeed));

        if (groupRef.current) {
            groupRef.current.scale.setScalar(scale);
            // Add a slight tilt when appearing for style
            groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, isVisible ? 0 : 0.2, lerpSpeed);
            groupRef.current.position.z = MathUtils.lerp(groupRef.current.position.z, isVisible ? 10 : 0, lerpSpeed);
        }
    });

    if (scale < 0.01 && !isVisible) return null;

    // Dynamic Panel Position: Mobile = Above Node, Desktop = Right of Node
    const xOffset = isMobile ? 0 : 10;
    const yOffset = isMobile ? 6 : 0; // Shift up 6 units on mobile
    const panelPos = [node.position[0] + xOffset, node.position[1] + yOffset, 5];

    return (
        <group position={panelPos} ref={groupRef}>
            <QuadraticBezierLine
                start={[isMobile ? 0 : -9, isMobile ? -5 : 0, -6]} // Start from node center (roughly)
                end={[0, 0, 0]}
                mid={[isMobile ? 0 : -4.5, isMobile ? -2 : 2, -3]}
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

            {true ? (
                <PreviewMedia url={PREVIEW_DATA[node.id] || '/thumbnail.png'} />
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

const EsconeonPopup = () => {
    const groupRef = useRef();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useFrame((state, delta) => {
        if (groupRef.current) {
            const target = mounted ? 1 : 0;
            const lerpSpeed = 3.0 * delta;

            groupRef.current.scale.lerp(new Vector3().setScalar(target), lerpSpeed);

            groupRef.current.children.forEach(child => {
                if (child.material) {
                    child.material.transparent = true;
                    // Check if it's the main video mesh map or just material
                    // We just lerp global opacity
                    child.material.opacity = MathUtils.lerp(child.material.opacity, target, lerpSpeed);
                }
            });
        }
    });

    const [video] = useState(() => {
        const vid = document.createElement('video');
        vid.src = '/esconeon.mp4';
        vid.crossOrigin = 'Anonymous';
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.autoplay = true;
        return vid;
    });

    useEffect(() => {
        const attemptPlay = () => {
            if (video.paused) {
                video.play().catch(e => console.warn("Video play failed", e));
            }
        };
        attemptPlay();
        // Fallback for browser autoplay policies
        const onInteraction = () => {
            attemptPlay();
            window.removeEventListener('click', onInteraction);
            window.removeEventListener('keydown', onInteraction);
        };
        window.addEventListener('click', onInteraction);
        window.addEventListener('keydown', onInteraction);

        return () => {
            window.removeEventListener('click', onInteraction);
            window.removeEventListener('keydown', onInteraction);
            video.pause();
        };
    }, [video]);

    return (
        <group position={[0, 21, 0]} ref={groupRef} scale={[0, 0, 0]}> {/* Shifted WAY up to 21 to clear Top Hardware/Node */}
            {/* Slightly offset Z to pop over the node */}
            <mesh>
                <planeGeometry args={[14, 8]} />
                <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0}>
                    <videoTexture attach="map" args={[video]} colorSpace={THREE.SRGBColorSpace} />
                </meshBasicMaterial>
            </mesh>
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

    useFrame((state, delta) => {
        if (groupRef.current) {
            const time = state.clock.elapsedTime;
            const targetScale = isDeploying ? 1 : 0;
            const hoverScale = hovered ? 1.15 : 1.0;

            // Smooth scaling with delta
            const lerpSpeed = 5.0 * delta;
            groupRef.current.scale.lerp(new Vector3().setScalar(targetScale * hoverScale), lerpSpeed);

            const zTarget = isActive ? 8 : 0;
            groupRef.current.position.z = MathUtils.lerp(groupRef.current.position.z, zTarget, lerpSpeed);

            if (isActive || hovered) {
                // Premium organic floating motion
                groupRef.current.rotation.y = Math.sin(time * 0.8) * 0.08;
                groupRef.current.rotation.x = Math.cos(time * 0.7) * 0.05;
                groupRef.current.position.y = node.position[1] + Math.sin(time * 1.5) * 0.1; // Bobbing
            } else {
                // Return to rest
                groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, 0, lerpSpeed);
                groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, 0, lerpSpeed);
                groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, node.position[1], lerpSpeed);
            }
        }
    });

    const isHighlight = isActive || hovered;

    return (
        <group
            position={node.position}
            ref={groupRef}
            onClick={(e) => { e.stopPropagation(); onVisit(node); }}
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
                    fontSize={0.85} // INCREASED SIZE (was 0.55)
                    fontWeight="bold"
                    color={isHighlight ? "#fff" : "#ddd"} // BRIGHTER IDLE COLOR (was #aaa)
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
        { id: 'velarix', position: [-20, 0, 0], label: 'VELARIX', sub: 'SOLUTIONS', color: PCB_BLUE, scale: 1 },    // LEFT
        { id: 'veroe_fun', position: [0, 10, 2], label: 'ESCO.IO', sub: 'MAIN_HUB', color: PCB_PINK, scale: 1.5 }, // TOP
        { id: 'veroe_space', position: [20, 0, 0], label: 'QUIETBIN', sub: 'ARCHIVE', color: PCB_GOLD, scale: 1 },  // RIGHT
        { id: 'discord_games', position: [0, -10, 0], label: 'DISCORD', sub: 'GAMES_LAB', color: "#7289da", scale: 1 }, // BOTTOM
    ],
    velarix: [
        { id: 'v_root', position: [-20, -6, 0], label: 'MAIN SITE', sub: 'velarixsolutions.nl', url: 'https://velarixsolutions.nl', trunkId: 'velarix' },
        { id: 'v_crypto', position: [-20, -9, 0], label: 'CRYPTO', sub: 'WEB3_NODES', url: 'https://crypto.velarixsolutions.nl', trunkId: 'velarix' },
        { id: 'v_find', position: [-20, -12, 0], label: 'FIND', sub: 'SEARCH_ENGINE', url: 'https://find.velarixsolutions.nl', trunkId: 'velarix' },
    ],
    veroe_fun: [
        { id: 'f_escosigns', position: [0, 4, 0], label: 'ESCOSIGNS', sub: 'DESIGN_PORTFOLIO', url: 'https://escosigns.veroe.fun', trunkId: 'veroe_fun' }, // Drops DOWN from top
        { id: 'f_spoti', position: [0, 1, 0], label: 'SPOTI_CLONE', sub: 'REQ_AUTH', url: 'https://spoti.veroe.fun', trunkId: 'veroe_fun' },
        { id: 'f_tnt', position: [0, -2, 0], label: 'TNT_CORE', sub: 'MINECRAFT_MW', url: 'https://tnt.veroe.fun', trunkId: 'veroe_fun' },
        { id: 'f_fight', position: [0, -5, 0], label: 'FIGHT_CLUB', sub: 'INTERACTIVE', url: 'https://fight.veroe.fun', trunkId: 'veroe_fun' },
    ],
    veroe_space: [
        { id: 's_root', position: [20, -6, 0], label: 'DATA_SHARD', sub: 'veroe.space', url: 'https://veroe.space', trunkId: 'veroe_space' },
    ],
    discord_games: [
        { id: 'd_tenk', position: [0, -16, 0], label: 'TENK', sub: 'DICE_GAME', url: 'https://discord.com/oauth2/authorize?client_id=1455067365694771364', trunkId: 'discord_games' },
        { id: 'd_square', position: [0, -19, 0], label: 'SQUARE_UP', sub: 'PUZZLE_LOGIC', url: 'https://discord.com/oauth2/authorize?client_id=1455077926273028258', trunkId: 'discord_games' },
        { id: 'd_spell', position: [0, -22, 0], label: 'SPELL_OR_FAIL', sub: 'WORD_GAME', url: 'https://discord.com/oauth2/authorize?client_id=1455079703940694081', trunkId: 'discord_games' },
    ]
};

const ElectricCable = ({ start, end, color }) => {
    const mid1 = [
        start[0] + (end[0] - start[0]) * 0.3,
        start[1],
        start[2] + (end[2] - start[2]) * 0.3
    ];
    const mid2 = [
        start[0] + (end[0] - start[0]) * 0.7,
        end[1],
        end[2] + (end[2] - start[2]) * 0.7
    ];

    // Points for the surge curve calculation
    // Using simple interpolation for the Surge, or distinct beziers

    // We render the Physical Wire + a Surge that travels it
    // To make sure surge follows the wire, we need points. 
    // CubicBezierLine uses a curve internally, let's approximate simply for the pulse visual or just overlay.

    return (
        <group>
            {/* 1. The Physical Dark Wire */}
            <CubicBezierLine
                start={start}
                end={end}
                midA={mid1}
                midB={mid2}
                color="#111" // Dark rubber/tech casing
                lineWidth={6}
                transparent
                opacity={1}
            />

            {/* 2. The Inner Core Wire (Thin colored line) */}
            <CubicBezierLine
                start={start}
                end={end}
                midA={mid1}
                midB={mid2}
                color={color}
                lineWidth={1}
                transparent
                opacity={0.3}
            />

            {/* 3. The Surge Pulse */}
            <SurgePulse
                points={[start, mid1, mid2, end]}
                color={color}
                speed={1.5}
            />

            {/* Joint Nodes - REMOVED per user request ("get rid of these") */}
            {/* <mesh position={start}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial color="#222" roughness={0.4} />
            </mesh>
            <mesh position={end}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial color="#222" roughness={0.4} />
            </mesh> */}
        </group>
    );
};

const ElectricDrop = ({ start, end, color }) => {
    return (
        <group>
            {/* Physical Vertical Wire */}
            <Line
                points={[start, end]}
                color="#111"
                lineWidth={4}
            />
            {/* Vibrancy Core */}
            <Line
                points={[start, end]}
                color={color}
                lineWidth={1}
                transparent
                opacity={0.4}
            />

            {/* Vertical Surge */}
            <SurgePulse
                points={[start, [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2], end]}
                color={color}
                speed={2.0}
            />

            {/* Start Orb - REMOVED per user request ("get rid of these")
            <mesh position={start}>
                <sphereGeometry args={[0.2]} />
                <meshBasicMaterial color={color} />
                <pointLight distance={3} intensity={3} color={color} />
            </mesh> 
            */}
        </group>
    );
};

// Reused pulse logic but refined for arbitrary points (Cubic approx or straight)
const SurgePulse = ({ points, color, speed = 1 }) => {
    const meshRef = useRef();
    // Create curve from points
    const [curve] = useState(() => new CatmullRomCurve3(points.map(p => new Vector3(...p))));

    useFrame((state) => {
        // Surge creates a "zap" effect
        const t = (state.clock.elapsedTime * speed) % 1;
        const pos = curve.getPointAt(t);
        if (meshRef.current) {
            meshRef.current.position.copy(pos);
            // Flickering intensity
            meshRef.current.material.opacity = 0.8 + Math.random() * 0.2;
            const scale = 1 + Math.random() * 0.5;
            meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color={color} transparent />
            <pointLight distance={5} intensity={8} color={color} decay={2} />
        </mesh>
    );
};

const Experience = React.forwardRef(({ onNodeActive, isCentering, onCenterComplete }, ref) => {
    const [currentMenu, setCurrentMenu] = useState('root');
    const [currentNodeIdx, setCurrentNodeIdx] = useState(0);
    const [previewActive, setPreviewActive] = useState(false);

    const activeNodes = TREE_DATA[currentMenu];
    const bugCurrentPos = useRef(new Vector3(...activeNodes[0].position));

    useEffect(() => {
        if (onNodeActive && activeNodes[0]) onNodeActive(activeNodes[0]);
    }, []);

    // Sync View Handler: Reset navigation when centering
    useEffect(() => {
        if (isCentering) {
            setCurrentMenu('root');
            setCurrentNodeIdx(1); // Default to middle Hero node (ESCO.IO)
            setPreviewActive(false);
        }
    }, [isCentering]);

    // Controller Logic
    const handleInput = (key) => {
        key = key.toLowerCase();
        let nextIdx = currentNodeIdx;

        if (key === 'enter' || key === ' ') {
            const selected = activeNodes[currentNodeIdx];
            if (TREE_DATA[selected.id]) {
                setCurrentMenu(selected.id);
                setCurrentNodeIdx(0);
                setPreviewActive(false);
            } else if (selected.url) {
                if (!previewActive) {
                    setPreviewActive(true);
                } else {
                    window.open(selected.url, '_blank');
                }
            }
            return;
        }

        if (key === 'escape') {
            setCurrentMenu('root');
            setPreviewActive(false);
            return;
        }

        const isUp = key === 'w' || key === 'arrowup';
        const isDown = key === 's' || key === 'arrowdown';
        const isLeft = key === 'a' || key === 'arrowleft';
        const isRight = key === 'd' || key === 'arrowright';

        if (currentMenu === 'root') {
            // DIAMOND NAVIGATION LOGIC
            // 0: Left (Velarix), 1: Top (Esco), 2: Right (Quietbin), 3: Bottom (Discord)

            if (currentNodeIdx === 0) { // LEFT
                if (isUp) nextIdx = 1; // -> Top
                if (isDown) nextIdx = 3; // -> Bottom
                if (isRight) nextIdx = 1; // -> Top (User pref: "Upper right/left") - let's default 'Right' to Top or Right? 
                // Natural flow: Right -> Center/Top? Let's go Top (1) or Right (2). 
                // Given geometry, Right from Left goes across. Let's send to Right (2).
                if (isRight) nextIdx = 2;
            }
            else if (currentNodeIdx === 1) { // TOP
                if (isLeft) nextIdx = 0; // -> Left
                if (isRight) nextIdx = 2; // -> Right
                if (isDown) nextIdx = 3; // -> Bottom
            }
            else if (currentNodeIdx === 2) { // RIGHT
                if (isUp) nextIdx = 1; // -> Top
                if (isDown) nextIdx = 3; // -> Bottom (User verified: "bottom arrow or s at right -> bottom")
                if (isLeft) nextIdx = 0; // -> Left (Cross)
            }
            else if (currentNodeIdx === 3) { // BOTTOM
                if (isUp) nextIdx = 1; // -> Top
                if (isLeft) nextIdx = 0; // -> Left ("upper left of it")
                if (isRight) nextIdx = 2; // -> Right ("upper right of it")
            }
        } else {
            // SUBMENU LINEAR LOGIC (Vertical List)
            if (isUp) {
                if (currentNodeIdx > 0) nextIdx--;
                else {
                    // Back to Root (optional, or stay clamped)
                    // Let's allow backing out if scrolling up past top
                    // setCurrentMenu('root'); 
                    // OR stay clamped
                }
            } else if (isDown) {
                if (currentNodeIdx < activeNodes.length - 1) nextIdx++;
            } else if (isLeft) {
                setCurrentMenu('root');
                // Find parent index to select it
                const parentIdx = TREE_DATA.root.findIndex(n => n.id === currentMenu);
                if (parentIdx !== -1) setCurrentNodeIdx(parentIdx);
                else setCurrentNodeIdx(1); // Default Top
                setPreviewActive(false); // Reset preview
                return;
            }
        }

        if (nextIdx !== currentNodeIdx) {
            setCurrentNodeIdx(nextIdx);
            setPreviewActive(false); // Reset preview when moving
            if (onNodeActive) onNodeActive(activeNodes[nextIdx]);
        }
    };

    // Expose handleInput to parent
    React.useImperativeHandle(ref, () => ({
        handleInput
    }));

    useEffect(() => {
        const handleKeyDown = (e) => handleInput(e.key);
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentNodeIdx, currentMenu, activeNodes, previewActive]);

    const trunkColor = TREE_DATA.root.find(n => n.id === currentMenu)?.color || PCB_BLUE;

    // Helper to activate a specific node/menu via click
    const activateNode = (node) => {
        // If it's a menu root (has children in TREE_DATA)
        if (TREE_DATA[node.id]) {
            setCurrentMenu(node.id);
            setCurrentNodeIdx(0);
            setPreviewActive(false);
            return;
        }

        // If 'node' is in the current menu, select it
        const idx = activeNodes.findIndex(n => n.id === node.id);
        if (idx !== -1) {
            if (idx !== currentNodeIdx) {
                setCurrentNodeIdx(idx);
                setPreviewActive(false);
            } else {
                // Already selected, trigger 'Enter' behavior
                if (node.url) {
                    if (!previewActive) setPreviewActive(true);
                    else window.open(node.url, '_blank');
                }
            }
        }
    };

    // CAMERA RIG - Restored & Updated for Diamond Layout
    const { camera } = useThree();
    useFrame((state, delta) => {
        const isRoot = currentMenu === 'root';
        const activeNodes = TREE_DATA[currentMenu];
        const targetNode = activeNodes[currentNodeIdx];
        const isMobile = state.viewport.aspect < 1;
        const isPreview = previewActive;

        // Base Z depth
        let targetZ = isRoot ? 85 : 50; // Increased Zoom Out (was 65)

        // Mobile Calibration: ZOOM OUT (Higher Z) as requested
        if (isMobile) {
            targetZ = isRoot ? 150 : 100; // Increased Mobile Zoom Out
        }

        if (isPreview) targetZ = isMobile ? 80 : 40;

        // X/Y follows the node slightly, but mostly stays centered on the column/row
        let targetX = 0;
        let targetY = 0;

        if (isRoot) {
            // For Diamond, we want to center on the whole group (0,0,0)
            targetX = 0;
            targetY = 0;
        } else {
            // If in submenu, center on the column parent
            const parent = TREE_DATA.root.find(n => n.id === currentMenu);
            if (parent) {
                targetX = parent.position[0];
                // For Discord (Bottom, Y=-10), center lower to see children
                if (parent.id === 'discord_games') targetY = parent.position[1] - 8;
                else targetY = parent.position[1];
            }

            // On mobile, force-lock to the exact node center to keep "orb on screen"
            if (isMobile && targetNode) {
                targetX = targetNode.position[0];
                targetY = targetNode.position[1];
            }
        }

        // Apply Parallax / Mouse Offset if regular view
        if (!isMobile && !isPreview) {
            targetX += (state.mouse.x * 2);
            targetY += (state.mouse.y * 2);
        }

        const lerpSpeed = 2.0 * delta;

        state.camera.position.x = MathUtils.lerp(state.camera.position.x, targetX, lerpSpeed);
        state.camera.position.y = MathUtils.lerp(state.camera.position.y, targetY, lerpSpeed);
        state.camera.position.z = MathUtils.lerp(state.camera.position.z, targetZ, lerpSpeed);

        state.camera.lookAt(targetX, targetY, 0); // Always look at the calculated center
    });

    return (
        <group>
            <Floor />
            <Environment preset="city" blur={1} />
            <EsconeonPopup /> {/* Moved inside component via position prop if supported, or manually adjust component default */}

            {/* DEMO HARDWARE */}
            <ServerBlade position={[24, 0, -10]} rotation={[0.5, 0.5, 0]} delay={0.5} /> {/* Right (Quietbin) - Centered Y, Wider X */}
            <ServerBlade position={[-24, 0, -15]} rotation={[0.2, -0.5, 0.2]} delay={0.8} /> {/* Left (Velarix) - Centered Y, Wider X */}
            <ServerBlade position={[0, -14, -12]} rotation={[-0.1, 0, 0.1]} delay={1.2} /> {/* Bottom (Discord) - Below Node (Symmetric Outside) */}
            <ServerBlade position={[0, 15, -12]} rotation={[0.3, 0, -0.1]} delay={1.4} /> {/* Top (Esco) - Above Node (Symmetric Outside) */}

            {/* Render Static Layout Connections */}
            {TREE_DATA.root.map(rootNode => {
                const children = TREE_DATA[rootNode.id];
                if (!children) return null;
                return children.map(child => (
                    <group key={`${rootNode.id}-${child.id}`} >
                        <ElectricDrop
                            start={rootNode.position}
                            end={child.position}
                            color={rootNode.color}
                        />
                    </group>
                ));
            })}

            {/* ELECTRICAL MAINS */}
            {/* ELECTRICAL NETWORK - DIAMOND CONFIGURATION */}
            {/* 1. Velarix (Left) -> Esco (Top) */}
            <ElectricCable
                start={[-20, 0, 0]}
                end={[-2, 9, 1]}
                color="#d00040"
            />
            {/* 2. Esco (Top) -> Quietbin (Right) */}
            <ElectricCable
                start={[2, 9, 1]}
                end={[20, 0, 0]}
                color="#d00040"
            />
            {/* 3. Quietbin (Right) -> Discord (Bottom) */}
            <ElectricCable
                start={[20, 0, 0]}
                end={[0, -10, 0]}
                color="#e8f080"
            />
            {/* 4. Discord (Bottom) -> Velarix (Left) */}
            <ElectricCable
                start={[0, -10, 0]}
                end={[-20, 0, 0]}
                color="#2dfccc"
            />

            {/* Render Nodes */}
            {
                Object.entries(TREE_DATA).map(([key, nodes]) => {
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
                                    onVisit={activateNode}
                                />
                                {activeState && node.url && (
                                    <PreviewWindow node={node} isVisible={previewActive} trunkColor={trunkColor} />
                                )}
                            </group>
                        );
                    });
                })
            }

            {/* <Bug currentPosition={bugCurrentPos.current} /> */}
        </group >
    );
});

export default Experience;
