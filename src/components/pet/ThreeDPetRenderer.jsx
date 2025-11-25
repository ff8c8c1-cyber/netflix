import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder, Cone, Float, Stars, Sparkles, Trail, Torus, Capsule, Box, Cloud, Line } from '@react-three/drei';
import * as THREE from 'three';

// --- CONSTANTS & UTILS ---
const COLORS = {
    'Fire': { primary: '#ef4444', secondary: '#b91c1c', emissive: '#ff0000', accent: '#fca5a5' },
    'Water': { primary: '#3b82f6', secondary: '#1d4ed8', emissive: '#00ffff', accent: '#93c5fd' },
    'Thunder': { primary: '#eab308', secondary: '#a16207', emissive: '#ffff00', accent: '#fde047' },
    'Wood': { primary: '#22c55e', secondary: '#15803d', emissive: '#00ff00', accent: '#86efac' },
    'Earth': { primary: '#a8a29e', secondary: '#57534e', emissive: '#8b4513', accent: '#d6d3d1' },
    'Light': { primary: '#fef08a', secondary: '#facc15', emissive: '#ffffff', accent: '#fef9c3' },
};

const Eye = ({ position, isSleeping, scale = 1 }) => (
    <group position={position} scale={scale}>
        <Sphere args={[0.15, 16, 16]} position={[0, 0, 0]}>
            <meshStandardMaterial color="white" />
        </Sphere>
        {!isSleeping ? (
            <>
                <Sphere args={[0.08, 16, 16]} position={[0, 0, 0.12]}>
                    <meshStandardMaterial color="black" />
                </Sphere>
                <Sphere args={[0.03, 16, 16]} position={[0.03, 0.03, 0.18]}>
                    <meshBasicMaterial color="white" />
                </Sphere>
            </>
        ) : (
            <mesh position={[0, 0, 0.13]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.08, 0.02, 16, 32, Math.PI]} />
                <meshBasicMaterial color="black" />
            </mesh>
        )}
    </group>
);

// --- SHARED COMPONENTS ---
const Limb = ({ position, rotation, scale = 1, color, isClawed = false, clawColor = 'white' }) => (
    <group position={position} rotation={rotation} scale={scale}>
        {/* Upper Arm */}
        <Capsule args={[0.12, 0.4, 4, 8]} position={[0, -0.2, 0]}>
            <meshToonMaterial color={color} />
        </Capsule>
        {/* Forearm */}
        <Capsule args={[0.1, 0.4, 4, 8]} position={[0, -0.5, 0.1]} rotation={[0.2, 0, 0]}>
            <meshToonMaterial color={color} />
        </Capsule>
        {/* Paw/Hand */}
        <Box args={[0.15, 0.1, 0.2]} position={[0, -0.75, 0.15]}>
            <meshToonMaterial color={color} />
        </Box>
        {/* Claws */}
        {isClawed && (
            <>
                <Cone args={[0.02, 0.1, 8]} position={[-0.05, -0.8, 0.25]} rotation={[0.5, 0, 0]}><meshStandardMaterial color={clawColor} /></Cone>
                <Cone args={[0.02, 0.1, 8]} position={[0, -0.8, 0.25]} rotation={[0.5, 0, 0]}><meshStandardMaterial color={clawColor} /></Cone>
                <Cone args={[0.02, 0.1, 8]} position={[0.05, -0.8, 0.25]} rotation={[0.5, 0, 0]}><meshStandardMaterial color={clawColor} /></Cone>
            </>
        )}
    </group>
);

// --- 1. DRAGON (Thanh Long) - ANIME VERSION ---
const Dragon = ({ colors, isSleeping, tier }) => {
    // Tiers: 0=Infant (Ấu Linh), 1=Spirit (Linh Thú), 2=Mystic (Huyền Thú), 3=Saint (Thánh Long), 4=Celestial (Tiên Long)
    const t = tier;
    const isBaby = t <= 1;

    const group = useRef();
    const bodyRefs = useRef([]);

    // Growth Config
    const segments = isBaby ? 6 : (t >= 4 ? 16 : 12);
    const thickness = isBaby ? 0.35 : (t >= 4 ? 0.6 : 0.45);

    useFrame(({ clock }) => {
        if (!group.current || isSleeping) return;
        const time = clock.getElapsedTime();

        // Float/Fly Animation
        const floatSpeed = t >= 4 ? 0.5 : 1.5;
        group.current.position.y = Math.sin(time * floatSpeed) * 0.2 + (t >= 4 ? 0.5 : 0);

        // Serpentine Body Movement
        bodyRefs.current.forEach((seg, i) => {
            if (!seg) return;
            const lag = i * 0.2;
            const amp = isBaby ? 0.1 : 0.2;
            // Horizontal wave
            seg.position.x = Math.sin(time * 2 - lag) * (0.2 + t * 0.05);
            // Vertical wave (slight)
            seg.position.y = Math.cos(time * 2 - lag) * 0.1 + (0.5 - i * (isBaby ? 0.25 : 0.35));
            // Rotation to follow curve
            seg.rotation.z = Math.cos(time * 2 - lag) * 0.2;
            seg.rotation.y = Math.sin(time * 2 - lag) * 0.1;
        });
    });

    // Visual Config
    const scaleColor = "#0d9488"; // Teal-600
    const lightningColor = "#a855f7"; // Purple-500
    const goldColor = "#fbbf24"; // Amber-400

    return (
        <group ref={group} scale={0.5 + t * 0.1}>
            {/* --- AURA & ENV --- */}
            {/* Anime effects removed per user request to improve visibility */}

            {/* --- HEAD --- */}
            <group position={[0, 0.8, 0]} scale={isBaby ? 1.3 : 1}>
                <Box args={[0.6, 0.5, 0.7]}><meshToonMaterial color={scaleColor} /></Box>
                {/* Snout */}
                <Box args={[0.4, 0.3, 0.4]} position={[0, -0.1, 0.5]}><meshToonMaterial color="#ccfbf1" /></Box>

                {/* Whiskers (Tier 0+) */}
                <group position={[0, -0.1, 0.7]}>
                    <Line points={[[-0.2, 0, 0], [-0.6, -0.3, 0.3]]} color={lightningColor} lineWidth={2} />
                    <Line points={[[0.2, 0, 0], [0.6, -0.3, 0.3]]} color={lightningColor} lineWidth={2} />
                </group>

                {/* Horns (Tier 2+) */}
                {t >= 2 && (
                    <group position={[0, 0.3, -0.2]}>
                        <Cone args={[0.05, 0.6, 4]} position={[-0.2, 0.3, 0]} rotation={[0, 0, 0.3]}><meshStandardMaterial color={goldColor} emissive={goldColor} emissiveIntensity={0.5} /></Cone>
                        <Cone args={[0.05, 0.6, 4]} position={[0.2, 0.3, 0]} rotation={[0, 0, -0.3]}><meshStandardMaterial color={goldColor} emissive={goldColor} emissiveIntensity={0.5} /></Cone>
                    </group>
                )}

                {/* Mane (Tier 3+) - Removed Cloud */}

                <Eye position={[-0.2, 0.1, 0.35]} isSleeping={isSleeping} />
                <Eye position={[0.2, 0.1, 0.35]} isSleeping={isSleeping} />
            </group>

            {/* --- BODY --- */}
            {Array.from({ length: segments }).map((_, i) => (
                <group key={i} ref={el => bodyRefs.current[i] = el} position={[0, -i * 0.4, 0]}>
                    <Sphere args={[thickness * (1 - i / segments * 0.5), 16, 16]}>
                        <meshToonMaterial color={scaleColor} />
                    </Sphere>
                    {/* Veins (Tier 1+) */}
                    {t >= 1 && (
                        <Torus args={[thickness * 0.85, 0.03, 16, 32]} rotation={[Math.PI / 2, 0, 0]}>
                            <meshBasicMaterial color={lightningColor} transparent opacity={0.5} />
                        </Torus>
                    )}
                    {/* Spines (Tier 2+) */}
                    {t >= 2 && (
                        <Cone position={[0, thickness * 0.9, 0]} args={[0.05, 0.4, 4]} rotation={[0, 0, 0]}>
                            <meshStandardMaterial color={lightningColor} emissive={lightningColor} emissiveIntensity={1} />
                        </Cone>
                    )}
                    {/* Legs */}
                    {(i === 2 || i === segments - 3) && (
                        <>
                            <Limb position={[-0.4, 0, 0]} color={scaleColor} isClawed clawColor={goldColor} />
                            <Limb position={[0.4, 0, 0]} color={scaleColor} isClawed clawColor={goldColor} />
                        </>
                    )}
                </group>
            ))}
        </group>
    );
};

// --- 2. PHOENIX (Phượng Hoàng) ---
const Phoenix = ({ colors, isSleeping, tier }) => {
    // Tiers: 0=Chick, 1=Fledgling, 2=Mystic, 3=Saint, 4=Celestial
    const t = tier;

    const group = useRef();
    const leftWing = useRef();
    const rightWing = useRef();

    useFrame(({ clock }) => {
        if (!group.current || isSleeping) return;
        const time = clock.getElapsedTime();

        // Floating (Tier 1+)
        const floatSpeed = t >= 1 ? 2 : 0;
        const floatAmp = t >= 1 ? 0.2 : 0;
        group.current.position.y = Math.sin(time * floatSpeed) * floatAmp + (t >= 1 ? 0.5 : 0);

        if (leftWing.current && rightWing.current) {
            const flapSpeed = t === 0 ? 8 : 4; // Babies flap fast
            const flapAmp = t === 0 ? 0.3 : 0.6;
            const flap = Math.sin(time * flapSpeed) * flapAmp;

            leftWing.current.rotation.z = flap + (t === 0 ? 0.5 : 0.2);
            rightWing.current.rotation.z = -flap - (t === 0 ? 0.5 : 0.2);

            // Elegant wing wave for higher tiers
            if (t >= 2) {
                leftWing.current.rotation.x = Math.sin(time * 3) * 0.1;
                rightWing.current.rotation.x = Math.sin(time * 3) * 0.1;
            }
        }
    });

    // --- Tier Specific Visuals ---
    const primaryColor = t === 0 ? "#f97316" : "#ef4444"; // Orange -> Red
    const wingColor = t >= 1 ? "#fbbf24" : primaryColor; // Gold edges from Tier 1
    const featherColor = t >= 2 ? "#f87171" : "#fca5a5"; // Flame petals

    const Feather = ({ position, rotation, scale }) => (
        <mesh position={position} rotation={rotation} scale={scale}>
            <coneGeometry args={[0.08, 0.4, 4]} />
            <meshToonMaterial color={featherColor} />
        </mesh>
    );

    const Wing = ({ invert = false }) => (
        <group>
            {/* Main Wing Bone */}
            <Box args={[t === 0 ? 0.5 : 1.2, 0.1, 0.3]} position={[invert ? (t === 0 ? -0.25 : -0.6) : (t === 0 ? 0.25 : 0.6), 0, 0]}>
                <meshToonMaterial color={primaryColor} />
            </Box>

            {/* Gold Edge (Tier 1+) */}
            {t >= 1 && (
                <Box args={[1.25, 0.05, 0.05]} position={[invert ? -0.6 : 0.6, 0.08, 0.15]}>
                    <meshBasicMaterial color="#fbbf24" />
                </Box>
            )}

            {/* Feathers (Tier 2+) */}
            {t >= 2 && [0, 1, 2, 3, 4].map(i => (
                <Feather
                    key={i}
                    position={[invert ? -0.2 - i * 0.2 : 0.2 + i * 0.2, -0.2, 0.1]}
                    rotation={[0, 0, invert ? 0.5 : -0.5]}
                    scale={[1, 1 + i * 0.2, 1]}
                />
            ))}
        </group>
    );

    return (
        <group ref={group} scale={0.6 + t * 0.15}>
            {/* AURA EFFECTS */}
            {t >= 3 && ( // Fire Aura
                <group>
                    <Sparkles count={40} scale={3} size={6} color="#ef4444" speed={2} />
                    <pointLight intensity={1} color="#ef4444" distance={3} />
                </group>
            )}
            {t >= 4 && ( // Celestial Avatar & Lotuses
                <group>
                    <Trail width={3} length={6} color="#fbbf24" attenuation={(t) => t}>
                        <mesh position={[0, -0.5, 0]}><sphereGeometry args={[0.1]} /><meshBasicMaterial color="#fbbf24" transparent opacity={0} /></mesh>
                    </Trail>
                    {/* Simplified Avatar Halo */}
                    <Torus args={[1.5, 0.05, 16, 32]} rotation={[0, 0, 0]}><meshBasicMaterial color="#ef4444" transparent opacity={0.3} /></Torus>
                    <Sparkles count={60} scale={4} size={8} color="#fbbf24" />
                </group>
            )}

            {/* BODY */}
            <Sphere args={[0.4, 16, 16]} scale={[1, t === 0 ? 1 : 1.4, 1]}>
                <meshToonMaterial color={primaryColor} />
            </Sphere>

            {/* HEAD */}
            <group position={[0, t === 0 ? 0.4 : 0.7, 0.2]}>
                <Sphere args={[0.3, 16, 16]}><meshToonMaterial color={primaryColor} /></Sphere>
                <Cone position={[0, -0.05, 0.3]} args={[0.08, 0.3, 4]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial color="#fbbf24" />
                </Cone>
                {/* Crest (Tier 2+) */}
                {t >= 2 && (
                    <group position={[0, 0.25, -0.1]} rotation={[-0.5, 0, 0]}>
                        <Cone args={[0.05, 0.5, 4]} position={[0, 0, 0]}><meshToonMaterial color="#fbbf24" /></Cone>
                        <Cone args={[0.04, 0.4, 4]} position={[0.1, -0.1, 0]} rotation={[0, 0, -0.5]}><meshToonMaterial color="#fbbf24" /></Cone>
                        <Cone args={[0.04, 0.4, 4]} position={[-0.1, -0.1, 0]} rotation={[0, 0, 0.5]}><meshToonMaterial color="#fbbf24" /></Cone>
                    </group>
                )}
                <Eye position={[-0.12, 0.05, 0.2]} isSleeping={isSleeping} scale={0.8} />
                <Eye position={[0.12, 0.05, 0.2]} isSleeping={isSleeping} scale={0.8} />
            </group>

            {/* WINGS */}
            <group position={[-0.3, 0.2, 0]} ref={leftWing}><Wing invert /></group>
            <group position={[0.3, 0.2, 0]} ref={rightWing}><Wing /></group>

            {/* LEGS (Tier 1+) */}
            {t >= 1 && (
                <>
                    <Cylinder args={[0.03, 0.03, 0.4, 8]} position={[-0.2, -0.6, 0]}><meshStandardMaterial color="#fbbf24" /></Cylinder>
                    <Cylinder args={[0.03, 0.03, 0.4, 8]} position={[0.2, -0.6, 0]}><meshStandardMaterial color="#fbbf24" /></Cylinder>
                </>
            )}

            {/* TAIL */}
            <group position={[0, -0.5, -0.3]}>
                {t === 0 ? ( // Short tail
                    <Sphere args={[0.15]}><meshToonMaterial color="#374151" /></Sphere>
                ) : ( // Long tails
                    <group>
                        {/* Main Tail */}
                        <Trail width={t >= 2 ? 3 : 1.5} length={t >= 3 ? 8 : 5} color={t >= 3 ? "#ef4444" : "#fbbf24"} attenuation={(t) => t * t}>
                            <mesh><sphereGeometry args={[0.1]} /><meshBasicMaterial color="#ef4444" /></mesh>
                        </Trail>
                        {/* Extra Layers (Tier 2+) */}
                        {t >= 2 && (
                            <>
                                <Trail width={2} length={4} color="#f87171" attenuation={(t) => t}>
                                    <mesh position={[-0.2, 0, 0]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#f87171" /></mesh>
                                </Trail>
                                <Trail width={2} length={4} color="#f87171" attenuation={(t) => t}>
                                    <mesh position={[0.2, 0, 0]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#f87171" /></mesh>
                                </Trail>
                            </>
                        )}
                    </group>
                )}
            </group>
        </group>
    );
};

// --- 3. TIGER (Bạch Hổ) ---
// --- 3. TIGER (Bạch Hổ) - MILLION DOLLAR VERSION ---
const Tiger = ({ colors, isSleeping, tier }) => {
    // Tiers: 0=Cub (Ấu Linh), 1=Adult (Linh Thú), 2=Beast (Huyền Thú), 3=Saint (Thánh Bạch Hổ), 4=Celestial (Tiên Bạch Hổ)
    const t = tier;
    const group = useRef();
    const headRef = useRef();
    const tailRef = useRef();

    useFrame(({ clock }) => {
        if (!group.current || isSleeping) return;
        const time = clock.getElapsedTime();

        // Breathing / Idle Animation
        const breathe = Math.sin(time * 2) * 0.02;
        group.current.scale.setScalar(1 + breathe);

        // Floating for Tier 4 (Celestial)
        if (t >= 4) {
            group.current.position.y = Math.sin(time) * 0.1 + 0.2;
        }

        // Tail Wag
        if (tailRef.current) {
            tailRef.current.rotation.z = Math.sin(time * 3) * 0.1 - 0.5;
            tailRef.current.rotation.x = Math.cos(time * 2) * 0.05 - 0.5;
        }
    });

    // --- VISUAL CONFIG ---
    const furColor = "white";
    const stripeColor = t >= 2 ? "#a5f3fc" : "#1f2937"; // Dark -> Ice Blue
    const armorColor = t >= 3 ? "#2dd4bf" : "#93c5fd"; // Ice Blue -> Jade
    const eyeColor = t >= 3 ? "#00ffff" : "#60a5fa"; // Blue -> Cyan Glow

    return (
        <group ref={group} scale={0.7 + t * 0.15}>
            {/* --- AURA & EFFECTS --- */}
            {t === 0 && <Sparkles count={10} scale={1.5} size={2} color="#e0f2fe" opacity={0.3} speed={0.2} />} {/* Faint Mist */}
            {t === 1 && <Sparkles position={[0, -0.5, 0]} count={20} scale={[1, 0.2, 1]} size={3} color="#3b82f6" speed={0.5} />} {/* Leg Mist */}
            {t === 2 && ( /* Snow Aura */
                <>
                    <Sparkles count={40} scale={2.5} size={4} speed={1.5} color="white" />
                    <Trail width={2} length={4} color="#a5f3fc" attenuation={(t) => t}>
                        <mesh position={[0, -0.5, 0]}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="#a5f3fc" transparent opacity={0} /></mesh>
                    </Trail>
                </>
            )}
            {t === 3 && ( /* Rune Circle */
                <group rotation={[Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
                    <Torus args={[1.5, 0.02, 16, 32]}><meshBasicMaterial color="#2dd4bf" transparent opacity={0.5} /></Torus>
                    <Torus args={[1.2, 0.01, 16, 32]} rotation={[0, 0, 0.5]}><meshBasicMaterial color="#2dd4bf" transparent opacity={0.3} /></Torus>
                </group>
            )}
            {t >= 4 && ( /* Celestial Domain & Avatar */
                <group>
                    <Sparkles count={100} scale={5} size={6} speed={0.2} color="white" opacity={0.8} />
                    {/* Giant Avatar Halo */}
                    <Torus position={[0, 0.5, -1]} args={[2.5, 0.05, 16, 64]}><meshBasicMaterial color="#a5f3fc" transparent opacity={0.2} /></Torus>
                    <pointLight intensity={2} color="#a5f3fc" distance={5} />
                </group>
            )}

            {/* --- BODY --- */}
            <group>
                {/* Torso */}
                <Sphere args={[0.6, 32, 32]} scale={[1, 0.9, 1.2]} position={[0, 0, 0]}>
                    <meshToonMaterial color={furColor} />
                </Sphere>
                {/* Chest/Belly (Lighter) */}
                <Sphere args={[0.55, 32, 32]} scale={[0.9, 0.8, 1.1]} position={[0, -0.05, 0.05]}>
                    <meshToonMaterial color="#f3f4f6" />
                </Sphere>

                {/* Stripes (Tier 1+) */}
                {t >= 1 && (
                    <>
                        <Torus position={[0, 0.1, 0]} args={[0.58, 0.03, 16, 32]} rotation={[0.1, 0, 0]}><meshStandardMaterial color={stripeColor} /></Torus>
                        <Torus position={[0, 0.3, -0.1]} args={[0.56, 0.03, 16, 32]} rotation={[-0.1, 0, 0]}><meshStandardMaterial color={stripeColor} /></Torus>
                        <Torus position={[0, -0.1, 0.1]} args={[0.57, 0.03, 16, 32]} rotation={[0.2, 0, 0]}><meshStandardMaterial color={stripeColor} /></Torus>
                    </>
                )}

                {/* Armor (Tier 2+) */}
                {t >= 2 && (
                    <group>
                        {/* Shoulder Spikes */}
                        <Cone position={[0.5, 0.4, 0.2]} args={[0.1, 0.4, 4]} rotation={[0, 0, -0.6]}><meshStandardMaterial color={armorColor} metalness={0.6} roughness={0.2} /></Cone>
                        <Cone position={[-0.5, 0.4, 0.2]} args={[0.1, 0.4, 4]} rotation={[0, 0, 0.6]}><meshStandardMaterial color={armorColor} metalness={0.6} roughness={0.2} /></Cone>
                        {/* Back Spikes */}
                        <Cone position={[0, 0.5, -0.2]} args={[0.08, 0.3, 4]} rotation={[-0.5, 0, 0]}><meshStandardMaterial color={armorColor} /></Cone>
                        <Cone position={[0, 0.4, -0.4]} args={[0.08, 0.3, 4]} rotation={[-0.7, 0, 0]}><meshStandardMaterial color={armorColor} /></Cone>
                    </group>
                )}

                {/* Wings (Tier 4) */}
                {t >= 4 && (
                    <group position={[0, 0.5, -0.2]}>
                        <Box position={[1, 0.5, 0]} args={[2, 0.1, 0.8]} rotation={[0, 0.2, 0.2]}><meshPhysicalMaterial color="#e0f2fe" transmission={0.6} thickness={1} roughness={0.1} /></Box>
                        <Box position={[-1, 0.5, 0]} args={[2, 0.1, 0.8]} rotation={[0, -0.2, -0.2]}><meshPhysicalMaterial color="#e0f2fe" transmission={0.6} thickness={1} roughness={0.1} /></Box>
                    </group>
                )}
            </group>

            {/* --- HEAD --- */}
            <group ref={headRef} position={[0, 0.6, 0.4]} scale={t === 0 ? 1.2 : 1}>
                {/* Main Head */}
                <Box args={[0.7, 0.6, 0.6]} position={[0, 0, 0]}>
                    <meshToonMaterial color={furColor} />
                </Box>
                {/* Muzzle */}
                <Box args={[0.4, 0.25, 0.2]} position={[0, -0.15, 0.35]}>
                    <meshToonMaterial color="#f3f4f6" />
                </Box>
                <Sphere args={[0.05]} position={[0, -0.1, 0.46]}><meshBasicMaterial color="pink" /></Sphere> {/* Nose */}

                {/* Ears */}
                <Cone position={[-0.25, 0.35, 0]} args={[0.12, 0.25, 4]} rotation={[0, 0, 0.4]}><meshToonMaterial color={furColor} /></Cone>
                <Cone position={[0.25, 0.35, 0]} args={[0.12, 0.25, 4]} rotation={[0, 0, -0.4]}><meshToonMaterial color={furColor} /></Cone>

                {/* Eyes */}
                <Eye position={[-0.2, 0.05, 0.31]} isSleeping={isSleeping} scale={0.8} />
                <Eye position={[0.2, 0.05, 0.31]} isSleeping={isSleeping} scale={0.8} />
                {/* Glowing Eyes (Tier 3+) */}
                {t >= 3 && !isSleeping && (
                    <>
                        <pointLight position={[-0.2, 0.05, 0.4]} intensity={0.5} color={eyeColor} distance={0.5} />
                        <pointLight position={[0.2, 0.05, 0.4]} intensity={0.5} color={eyeColor} distance={0.5} />
                    </>
                )}

                {/* --- FOREHEAD MARKS --- */}
                {t === 0 && <Sphere position={[0, 0.15, 0.31]} args={[0.05]}><meshBasicMaterial color="#bae6fd" /></Sphere>} {/* Ice Drop */}
                {t === 1 && ( /* V-Shape */
                    <group position={[0, 0.15, 0.31]}>
                        <Box args={[0.05, 0.2, 0.01]} position={[-0.08, 0, 0]} rotation={[0, 0, -0.5]}><meshBasicMaterial color="#3b82f6" /></Box>
                        <Box args={[0.05, 0.2, 0.01]} position={[0.08, 0, 0]} rotation={[0, 0, 0.5]}><meshBasicMaterial color="#3b82f6" /></Box>
                    </group>
                )}
                {t >= 2 && t < 4 && ( /* King Mark (王) */
                    <group position={[0, 0.15, 0.31]}>
                        <Box args={[0.25, 0.04, 0.01]} position={[0, 0.08, 0]}><meshBasicMaterial color={t === 3 ? "#00ffff" : "black"} /></Box>
                        <Box args={[0.2, 0.04, 0.01]} position={[0, 0, 0]}><meshBasicMaterial color={t === 3 ? "#00ffff" : "black"} /></Box>
                        <Box args={[0.25, 0.04, 0.01]} position={[0, -0.08, 0]}><meshBasicMaterial color={t === 3 ? "#00ffff" : "black"} /></Box>
                        <Box args={[0.04, 0.2, 0.01]} position={[0, 0, 0]}><meshBasicMaterial color={t === 3 ? "#00ffff" : "black"} /></Box>
                    </group>
                )}
                {t >= 4 && ( /* Heaven Snow Mark (Crown) */
                    <group position={[0, 0.4, 0]}>
                        <Torus args={[0.15, 0.02, 16, 32]} rotation={[Math.PI / 2, 0, 0]}><meshBasicMaterial color="#00ffff" /></Torus>
                        <Cone args={[0.05, 0.3, 4]} position={[0, 0.2, 0]}><meshBasicMaterial color="#00ffff" /></Cone>
                        <Sparkles count={10} scale={0.5} color="#00ffff" />
                    </group>
                )}

                {/* Mane (Tier 3+) */}
                {t >= 3 && (
                    <group position={[0, 0, -0.3]}>
                        <Sphere args={[0.5, 16, 16]} scale={[1.2, 1, 0.5]}><meshToonMaterial color="white" /></Sphere>
                        <Cone args={[0.1, 0.4, 4]} position={[0.4, 0.2, 0]} rotation={[0, 0, -0.5]}><meshToonMaterial color="white" /></Cone>
                        <Cone args={[0.1, 0.4, 4]} position={[-0.4, 0.2, 0]} rotation={[0, 0, 0.5]}><meshToonMaterial color="white" /></Cone>
                    </group>
                )}
            </group>

            {/* --- LIMBS --- */}
            {/* Front Left */}
            <Limb position={[-0.4, -0.3, 0.3]} rotation={[0.2, 0, 0]} color={furColor} isClawed={t >= 1} clawColor={t >= 1 ? "#a5f3fc" : "gray"} />
            {/* Front Right */}
            <Limb position={[0.4, -0.3, 0.3]} rotation={[0.2, 0, 0]} color={furColor} isClawed={t >= 1} clawColor={t >= 1 ? "#a5f3fc" : "gray"} />
            {/* Back Left */}
            <Limb position={[-0.4, -0.5, -0.3]} rotation={[-0.2, 0, 0]} color={furColor} isClawed={t >= 1} clawColor={t >= 1 ? "#a5f3fc" : "gray"} />
            {/* Back Right */}
            <Limb position={[0.4, -0.5, -0.3]} rotation={[-0.2, 0, 0]} color={furColor} isClawed={t >= 1} clawColor={t >= 1 ? "#a5f3fc" : "gray"} />

            {/* --- TAIL --- */}
            <group ref={tailRef} position={[0, -0.4, -0.5]}>
                <Cylinder args={[0.08, 0.04, t === 0 ? 0.4 : 1.2, 8]} position={[0, -0.2, -0.2]} rotation={[-1, 0, 0]}><meshToonMaterial color={furColor} /></Cylinder>
                {t >= 2 && ( /* Blade Tail Tip */
                    <Cone position={[0, -0.8, -0.8]} args={[0.1, 0.4, 4]} rotation={[-0.5, 0, 0]}><meshStandardMaterial color="#a5f3fc" emissive="#a5f3fc" emissiveIntensity={0.5} /></Cone>
                )}
            </group>
        </group>
    );
};

// --- 4. FOX (Cửu Vĩ Hồ) ---
const Fox = ({ colors, isSleeping, tier }) => {
    // Stages: Baby (0-1) [1 Tail], Adult (2-4) [3-5 Tails], Beast (5+) [9 Tails]
    const isBaby = tier <= 1;
    const isBeast = tier >= 5;
    const tails = isBaby ? 1 : (isBeast ? 9 : 3 + (tier - 2));
    const tailRefs = useRef([]);

    useFrame(({ clock }) => {
        if (isSleeping) return;
        const t = clock.getElapsedTime();
        tailRefs.current.forEach((tail, i) => {
            if (!tail) return;
            const phase = i * 0.5;
            tail.rotation.z = Math.sin(t * 1.5 + phase) * 0.3 + (i - (tails - 1) / 2) * (isBeast ? 0.3 : 0.2);
            tail.rotation.x = Math.cos(t * 1.0 + phase) * 0.1 - 0.5;
        });
    });

    return (
        <group scale={isBaby ? 0.6 : (isBeast ? 1.3 : 1)}>
            {/* BODY */}
            <Capsule args={[0.25, 0.8, 4, 16]} position={[0, -0.2, 0]}>
                <meshToonMaterial color={colors.primary} />
            </Capsule>

            {/* HEAD */}
            <group position={[0, 0.5, 0]} scale={isBaby ? 1.3 : 1}>
                <Sphere args={[0.35, 32, 32]} scale={[1, 0.9, 1]}><meshToonMaterial color={colors.primary} /></Sphere>
                <Cone position={[0, -0.1, 0.35]} args={[0.12, 0.3, 32]} rotation={[Math.PI / 2, 0, 0]}><meshToonMaterial color={colors.primary} /></Cone>

                {/* Ears */}
                <Cone position={[-0.2, 0.4, 0]} args={[0.1, 0.5, 16]} rotation={[0, 0, 0.3]}><meshToonMaterial color={colors.secondary} /></Cone>
                <Cone position={[0.2, 0.4, 0]} args={[0.1, 0.5, 16]} rotation={[0, 0, -0.3]}><meshToonMaterial color={colors.secondary} /></Cone>

                <Eye position={[-0.15, 0.1, 0.25]} isSleeping={isSleeping} scale={0.9} />
                <Eye position={[0.15, 0.1, 0.25]} isSleeping={isSleeping} scale={0.9} />
            </group>

            {/* LIMBS */}
            <Limb position={[-0.2, -0.5, 0.15]} rotation={[0, 0, 0]} scale={0.5} color={colors.primary} />
            <Limb position={[0.2, -0.5, 0.15]} rotation={[0, 0, 0]} scale={0.5} color={colors.primary} />
            <Limb position={[-0.2, -0.8, -0.1]} rotation={[-0.2, 0, 0]} scale={0.5} color={colors.primary} />
            <Limb position={[0.2, -0.8, -0.1]} rotation={[-0.2, 0, 0]} scale={0.5} color={colors.primary} />

            {/* TAILS */}
            {Array.from({ length: tails }).map((_, i) => (
                <group key={i} position={[0, -0.5, -0.2]} ref={el => tailRefs.current[i] = el}>
                    <Capsule args={[0.15, 1, 4, 8]} position={[0, 0.5, 0]}><meshToonMaterial color={colors.primary} /></Capsule>
                    <Sphere position={[0, 1.1, 0]} args={[0.12]}><meshBasicMaterial color="white" /></Sphere>
                </group>
            ))}

            {/* Beast Aura */}
            {isBeast && <Sparkles count={50} scale={3} size={5} color={colors.emissive} />}
        </group>
    );
};

// --- MAIN RENDERER ---
const ThreeDPetRenderer = ({ species, element, tier, mood = 'Normal', skills = [], castSkill = null }) => {
    // Normalize Inputs
    const normalizeSpecies = (s) => {
        if (!s) return 'Dragon';
        const lower = s.toLowerCase();
        if (lower.includes('long') || lower.includes('dragon')) return 'Dragon';
        if (lower.includes('phượng') || lower.includes('tước') || lower.includes('phoenix')) return 'Phoenix';
        if (lower.includes('hổ') || lower.includes('tiger')) return 'Tiger';
        if (lower.includes('hồ') || lower.includes('cáo') || lower.includes('fox')) return 'Fox';
        return 'Dragon'; // Fallback
    };

    const normalizeElement = (e) => {
        if (!e) return 'Fire';
        const lower = e.toLowerCase();
        if (lower === 'hỏa' || lower === 'fire') return 'Fire';
        if (lower === 'thủy' || lower === 'water' || lower === 'băng') return 'Water';
        if (lower === 'lôi' || lower === 'thunder') return 'Thunder';
        if (lower === 'mộc' || lower === 'wood') return 'Wood';
        if (lower === 'thổ' || lower === 'earth') return 'Earth';
        if (lower === 'quang' || lower === 'light' || lower === 'tâm') return 'Light';
        return 'Fire';
    };

    const normSpecies = normalizeSpecies(species);
    const normElement = normalizeElement(element);
    const colors = COLORS[normElement] || COLORS['Fire'];

    const [isSleeping, setIsSleeping] = useState(false);
    const [activeEffect, setActiveEffect] = useState(null);

    // Effect Timer
    useEffect(() => {
        if (castSkill) {
            setActiveEffect(castSkill);
            const timer = setTimeout(() => setActiveEffect(null), 2000); // Effects last 2s
            return () => clearTimeout(timer);
        }
    }, [castSkill]);

    useEffect(() => {
        const timer = setTimeout(() => setIsSleeping(true), 10000);
        const reset = () => { setIsSleeping(false); clearTimeout(timer); };
        window.addEventListener('mousemove', reset);
        window.addEventListener('click', reset);
        return () => { clearTimeout(timer); window.removeEventListener('mousemove', reset); window.removeEventListener('click', reset); };
    }, []);

    return (
        <div className="w-full h-full relative">
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
                <color attach="background" args={['#111827']} />
                <ambientLight intensity={0.7} />
                <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={1} castShadow color={colors.accent} />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color={colors.primary} />
                <spotLight position={[0, 5, -5]} intensity={1} color="white" />
                <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={20 + Number(tier) * 5} scale={4 + Number(tier)} size={2} speed={0.4} opacity={0.4} color={colors.emissive} />

                {/* SKILL EFFECTS OVERLAY */}
                {/* --- DRAGON SKILLS --- */}
                {activeEffect === 'Lôi Nha' && (
                    <group>
                        <Trail width={5} length={4} color="#a855f7" attenuation={(t) => t}>
                            <mesh position={[0, 0, 0]}><sphereGeometry args={[0.2]} /><meshBasicMaterial color="#a855f7" /></mesh>
                        </Trail>
                        <Sparkles count={20} scale={2} size={3} color="#fbbf24" speed={5} />
                        {/* Thunder Mark */}
                        <Torus position={[0, 0, 1]} args={[0.5, 0.05, 16, 32]}><meshBasicMaterial color="#a855f7" transparent opacity={0.8} /></Torus>
                    </group>
                )}
                {activeEffect === 'Lôi Vũ' && (
                    <group>
                        {/* Petal Lightning */}
                        {[0, 1, 2, 3, 4].map(i => (
                            <group key={i} rotation={[0, 0, i * Math.PI * 0.4]}>
                                <Trail width={2} length={3} color="#a855f7" attenuation={(t) => t}>
                                    <mesh position={[0, 1, 0]}><sphereGeometry args={[0.1]} /><meshBasicMaterial color="#a855f7" /></mesh>
                                </Trail>
                            </group>
                        ))}
                        <Torus args={[2, 0.05, 16, 64]} rotation={[Math.PI / 2, 0, 0]}><meshBasicMaterial color="#fbbf24" /></Torus>
                    </group>
                )}
                {activeEffect === 'Thiên Lôi Liên Kích' && (
                    <group>
                        {/* Vertical Strikes */}
                        <Cylinder args={[0.1, 0.1, 10, 8]} position={[0, 5, 0]}><meshBasicMaterial color="#a855f7" /></Cylinder>
                        <Sparkles count={30} scale={5} size={3} color="#fbbf24" speed={10} />
                        <Torus args={[1, 0.1, 16, 32]} rotation={[Math.PI / 2, 0, 0]}><meshBasicMaterial color="#a855f7" /></Torus>
                    </group>
                )}
                {activeEffect === 'Cửu Thiên Lôi Long' && (
                    <group>
                        {/* 9 Strikes Rain */}
                        <Sparkles count={50} scale={10} size={3} color="#a855f7" speed={5} />
                        <Torus args={[4, 0.2, 16, 64]} rotation={[Math.PI / 2, 0, 0]}><meshBasicMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} /></Torus>
                        <pointLight intensity={1} color="#a855f7" distance={20} />
                    </group>
                )}

                {/* --- TIGER SKILLS --- */}
                {activeEffect === 'Băng Trảo' && (
                    <group>
                        <Sparkles count={30} scale={4} size={3} color="#a5f3fc" speed={5} />
                        <Trail width={4} length={3} color="#a5f3fc" attenuation={(t) => t}>
                            <mesh position={[0.5, 0.5, 1]}><sphereGeometry args={[0.1]} /><meshBasicMaterial color="#a5f3fc" /></mesh>
                        </Trail>
                    </group>
                )}
                {activeEffect === 'Hàn Nha Cắn Xé' && (
                    <group>
                        <Torus args={[0.8, 0.1, 16, 32]} rotation={[0, 0, 0]}><meshBasicMaterial color="#3b82f6" transparent opacity={0.7} /></Torus>
                        <Sparkles count={40} scale={2} size={3} color="#3b82f6" speed={3} />
                    </group>
                )}
                {activeEffect === 'Bạo Tuyết Liên Trảm' && (
                    <group>
                        <Trail width={6} length={5} color="white" attenuation={(t) => t}>
                            <mesh position={[-1, 1, 1]}><sphereGeometry args={[0.1]} /><meshBasicMaterial color="white" /></mesh>
                        </Trail>
                        <Trail width={6} length={5} color="white" attenuation={(t) => t}>
                            <mesh position={[1, -1, 1]}><sphereGeometry args={[0.1]} /><meshBasicMaterial color="white" /></mesh>
                        </Trail>
                        <Sparkles count={40} scale={5} size={3} color="white" speed={5} />
                    </group>
                )}
                {activeEffect === 'Thiên Hàn Hổ Khiếu' && (
                    <group>
                        <Torus args={[2, 0.1, 16, 32]} rotation={[0, 0, 0]}><meshBasicMaterial color="#00ffff" transparent opacity={0.5} /></Torus>
                        <Torus args={[3, 0.1, 16, 32]} rotation={[0, 0, 0]}><meshBasicMaterial color="#00ffff" transparent opacity={0.3} /></Torus>
                        <Sparkles count={50} scale={8} size={3} color="#00ffff" speed={4} />
                    </group>
                )}
                {activeEffect === 'Tuyết Vực Pháp Tướng' && (
                    <group>
                        <Stars radius={10} depth={5} count={100} factor={2} fade speed={3} />
                        <Sparkles count={60} scale={10} size={3} color="white" speed={0.5} opacity={0.5} />
                        <pointLight intensity={1} color="#a5f3fc" distance={20} />
                    </group>
                )}

                {/* --- PHOENIX SKILLS --- */}
                {activeEffect === 'Hỏa Linh Châm' && <Sparkles count={30} scale={2} size={3} color="#ef4444" speed={5} />}
                {activeEffect === 'Liệt Diễm Vũ' && (
                    <group>
                        <Torus args={[2, 0.1, 16, 32]} rotation={[Math.PI / 2, 0, 0]}><meshBasicMaterial color="#ef4444" transparent opacity={0.5} /></Torus>
                        <Sparkles count={40} scale={5} size={3} color="#fbbf24" speed={3} />
                    </group>
                )}
                {activeEffect === 'Thiên Hỏa Niết Bàn' && (
                    <group>
                        <pointLight intensity={1} color="#fbbf24" distance={10} />
                        <Sparkles count={60} scale={8} size={3} color="#fbbf24" speed={5} />
                    </group>
                )}

                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <group position={[0, -0.5, 0]}>
                        {normSpecies === 'Dragon' && <Dragon colors={colors} tier={tier} isSleeping={isSleeping} />}
                        {normSpecies === 'Phoenix' && <Phoenix colors={colors} tier={tier} isSleeping={isSleeping} />}
                        {normSpecies === 'Tiger' && <Tiger colors={colors} tier={tier} isSleeping={isSleeping} />}
                        {normSpecies === 'Fox' && <Fox colors={colors} tier={tier} isSleeping={isSleeping} />}
                    </group>
                </Float>
                <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.5} />
            </Canvas>
            {isSleeping && <div className="absolute top-10 right-10 text-4xl animate-bounce pointer-events-none">💤</div>}

            {/* Skill Name Overlay */}
            {activeEffect && (
                <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 animate-pulse drop-shadow-lg">
                        {activeEffect}
                    </h2>
                </div>
            )}
        </div>
    );
};

export default ThreeDPetRenderer;
