import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { PET_ASSETS } from './petAssets';

const COLORS = {
    'Fire': { primary: '#ef4444', secondary: '#991b1b', accent: '#fca5a5', glow: '#f87171' },
    'Water': { primary: '#3b82f6', secondary: '#1e40af', accent: '#93c5fd', glow: '#60a5fa' },
    'Thunder': { primary: '#eab308', secondary: '#854d0e', accent: '#fde047', glow: '#facc15' },
    'Wood': { primary: '#22c55e', secondary: '#166534', accent: '#86efac', glow: '#4ade80' },
    'Earth': { primary: '#a8a29e', secondary: '#57534e', accent: '#d6d3d1', glow: '#d6d3d1' },
    'Light': { primary: '#fef08a', secondary: '#eab308', accent: '#ffffff', glow: '#fef9c3' },
};

const ParticleSystem = ({ element }) => {
    const particles = useMemo(() => Array.from({ length: 8 }), []);
    const colors = COLORS[element] || COLORS['Fire'];

    return (
        <g>
            {particles.map((_, i) => (
                <motion.circle
                    key={i}
                    r={Math.random() * 3 + 1}
                    fill={colors.glow}
                    initial={{ opacity: 0, y: 0, x: 0 }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        y: [-20, -80 - Math.random() * 50],
                        x: [0, (Math.random() - 0.5) * 40]
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeOut"
                    }}
                    cx={100 + (Math.random() - 0.5) * 100}
                    cy={200}
                />
            ))}
        </g>
    );
};

const InteractivePetRenderer = ({ species, element, tier, mood = 'Normal' }) => {
    const colors = COLORS[element] || COLORS['Fire'];
    const assets = PET_ASSETS[species] || PET_ASSETS['Dragon'];
    const containerRef = useRef(null);

    // Mouse Tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Physics: Head follows mouse with spring
    const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
    const headX = useSpring(mouseX, springConfig);
    const headY = useSpring(mouseY, springConfig);

    // Physics: Eyes follow faster
    const eyeX = useTransform(headX, v => v * 0.8);
    const eyeY = useTransform(headY, v => v * 0.8);

    // Physics: Body follows head with lag (Drag effect)
    const bodyX = useTransform(headX, v => v * 0.2);
    const bodyY = useTransform(headY, v => v * 0.2);

    // States
    const [isHappy, setIsHappy] = useState(false);
    const [isSleeping, setIsSleeping] = useState(false);
    const inactivityTimer = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current || isSleeping) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Limit movement range
        const x = Math.min(Math.max((e.clientX - centerX) / 8, -25), 25);
        const y = Math.min(Math.max((e.clientY - centerY) / 8, -20), 20);

        mouseX.set(x);
        mouseY.set(y);
        resetSleepTimer();
    };

    const resetSleepTimer = () => {
        if (isSleeping) setIsSleeping(false);
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(() => setIsSleeping(true), 8000);
    };

    useEffect(() => {
        resetSleepTimer();
        return () => clearTimeout(inactivityTimer.current);
    }, []);

    const handlePetClick = () => {
        setIsHappy(true);
        setTimeout(() => setIsHappy(false), 2000);
        resetSleepTimer();
    };

    // --- RENDERERS ---

    const renderHead = () => (
        <motion.g style={{ x: headX, y: headY }}>
            {/* Base Head with Gradient */}
            <path d={assets.head.base} fill={`url(#bodyGradient-${element})`} stroke={colors.secondary} strokeWidth="2" />

            {/* Species Details */}
            {species === 'Dragon' && (
                <>
                    <path d={assets.head.snout} fill={colors.secondary} opacity="0.3" />
                    <path d={assets.head.mane} fill="none" stroke={colors.accent} strokeWidth="2" />
                    {tier >= 1 && assets.head.horns.map((d, i) => (
                        <path key={i} d={d} fill="none" stroke={colors.secondary} strokeWidth="3" strokeLinecap="round" />
                    ))}
                </>
            )}
            {species === 'Phoenix' && (
                <>
                    <path d={assets.head.beak} fill="#fbbf24" stroke={colors.secondary} strokeWidth="1" />
                    <path d={assets.head.crest} fill={colors.accent} />
                </>
            )}
            {(species === 'Tiger' || species === 'Fox') && (
                <>
                    {assets.head.ears.map((d, i) => (
                        <path key={i} d={d} fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
                    ))}
                    {assets.head.cheeks?.map((d, i) => (
                        <path key={i} d={d} fill={colors.accent} opacity="0.6" />
                    ))}
                    {species === 'Tiger' && assets.head.stripes.map((d, i) => (
                        <path key={i} d={d} stroke={colors.secondary} strokeWidth="3" strokeLinecap="round" />
                    ))}
                </>
            )}

            {/* Eyes */}
            <motion.g style={{ x: eyeX, y: eyeY }}>
                <circle cx="90" cy={species === 'Dragon' ? 70 : 80} r="6" fill="white" />
                <circle cx="110" cy={species === 'Dragon' ? 70 : 80} r="6" fill="white" />

                {!isSleeping ? (
                    <>
                        <circle cx="90" cy={species === 'Dragon' ? 70 : 80} r="2.5" fill="#1f2937" />
                        <circle cx="110" cy={species === 'Dragon' ? 70 : 80} r="2.5" fill="#1f2937" />
                        {/* Shine */}
                        <circle cx="92" cy={species === 'Dragon' ? 68 : 78} r="1" fill="white" />
                        <circle cx="112" cy={species === 'Dragon' ? 68 : 78} r="1" fill="white" />
                    </>
                ) : (
                    <>
                        <path d={`M86 ${species === 'Dragon' ? 70 : 80} Q 90 ${species === 'Dragon' ? 74 : 84} 94 ${species === 'Dragon' ? 70 : 80}`} stroke="#1f2937" strokeWidth="2" fill="none" />
                        <path d={`M106 ${species === 'Dragon' ? 70 : 80} Q 110 ${species === 'Dragon' ? 74 : 84} 114 ${species === 'Dragon' ? 70 : 80}`} stroke="#1f2937" strokeWidth="2" fill="none" />
                    </>
                )}
            </motion.g>
        </motion.g>
    );

    const renderBody = () => {
        if (species === 'Dragon') {
            return (
                <g>
                    {assets.body.segments.map((seg, i) => (
                        <motion.circle
                            key={i}
                            cx="100" cy={100 + seg.offset}
                            r={seg.size}
                            fill={`url(#bodyGradient-${element})`}
                            stroke={colors.secondary}
                            strokeWidth="2"
                            style={{
                                x: useTransform(headX, v => v * (0.1 + i * 0.05)), // Lag effect per segment
                                y: useTransform(headY, v => v * (0.1 + i * 0.05))
                            }}
                        />
                    ))}
                    <motion.path
                        d={assets.body.tail}
                        fill={colors.accent}
                        transform={`translate(85, ${100 + assets.body.segments[4].offset})`}
                    />
                </g>
            );
        }

        return (
            <motion.g style={{ x: bodyX, y: bodyY }}>
                {/* Tail Layer (Behind Body) */}
                {species === 'Phoenix' && assets.tail.map((d, i) => (
                    <motion.path
                        key={i} d={d} fill="none" stroke={colors.accent} strokeWidth="4" strokeLinecap="round"
                        animate={{ rotate: [0, 5, 0] }} transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                        style={{ originX: 0.5, originY: 0 }}
                    />
                ))}
                {species === 'Tiger' && (
                    <motion.path
                        d={assets.tail} fill="none" stroke={colors.primary} strokeWidth="12" strokeLinecap="round"
                        animate={{ rotate: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity }}
                        style={{ originX: 0, originY: 1 }}
                    />
                )}
                {species === 'Fox' && (
                    <g>
                        <motion.path d={assets.tail.base} fill="none" stroke={colors.primary} strokeWidth="25" strokeLinecap="round" />
                        <motion.path d={assets.tail.tip} fill="none" stroke="white" strokeWidth="25" strokeLinecap="round" />
                    </g>
                )}

                {/* Wings Layer (Phoenix) */}
                {species === 'Phoenix' && (
                    <>
                        {assets.wings.left.map((d, i) => (
                            <motion.path key={i} d={d} fill={i === 0 ? colors.primary : colors.accent} stroke={colors.secondary} animate={{ rotate: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ originX: 1, originY: 1 }} />
                        ))}
                        {assets.wings.right.map((d, i) => (
                            <motion.path key={i} d={d} fill={i === 0 ? colors.primary : colors.accent} stroke={colors.secondary} animate={{ rotate: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ originX: 0, originY: 1 }} />
                        ))}
                    </>
                )}

                {/* Main Body Shape */}
                <motion.path
                    d={assets.body}
                    fill={`url(#bodyGradient-${element})`}
                    stroke={colors.secondary}
                    strokeWidth="2"
                    animate={{
                        scaleX: isSleeping ? [1, 1.05, 1] : [1, 1.02, 1], // Squash
                        scaleY: isSleeping ? [1, 0.95, 1] : [1, 0.98, 1]  // Stretch
                    }}
                    transition={{ duration: isSleeping ? 3 : 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.g>
        );
    };

    // --- MAIN RENDER ---

    if (tier === 0) return (
        <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={handlePetClick}>
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                <defs>
                    <radialGradient id={`eggGradient-${element}`} cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor={colors.accent} />
                        <stop offset="100%" stopColor={colors.primary} />
                    </radialGradient>
                </defs>
                <motion.ellipse cx="100" cy="100" rx="50" ry="70" fill={`url(#eggGradient-${element})`} stroke={colors.secondary} strokeWidth="2"
                    animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                {isHappy && <motion.text x="90" y="50" fontSize="24" animate={{ y: -20, opacity: [1, 0] }}>❤️</motion.text>}
            </svg>
        </div>
    );

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
            className="w-full h-full flex items-center justify-center cursor-pointer relative"
            onClick={handlePetClick}
        >
            <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-2xl overflow-visible">
                <defs>
                    {/* 3D Gradient Definition */}
                    <radialGradient id={`bodyGradient-${element}`} cx="30%" cy="30%" r="80%">
                        <stop offset="0%" stopColor={colors.accent} />
                        <stop offset="40%" stopColor={colors.primary} />
                        <stop offset="100%" stopColor={colors.secondary} />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Layer 1: Particles (Background) */}
                {tier >= 2 && <ParticleSystem element={element} />}

                {/* Layer 2: Body & Limbs */}
                {renderBody()}

                {/* Layer 3: Head (Top) */}
                {renderHead()}

                {/* Layer 4: Status Effects */}
                {isSleeping && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.text x="140" y="50" fontSize="20" fill="white" animate={{ y: -20, opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}>Z</motion.text>
                        <motion.text x="150" y="40" fontSize="16" fill="white" animate={{ y: -20, opacity: [0, 1, 0] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }}>z</motion.text>
                    </motion.g>
                )}
                {isHappy && (
                    <motion.g>
                        <motion.text x="80" y="40" fontSize="24" initial={{ scale: 0 }} animate={{ scale: 1, y: -20, opacity: 0 }} transition={{ duration: 1 }}>❤️</motion.text>
                        <motion.text x="120" y="30" fontSize="24" initial={{ scale: 0 }} animate={{ scale: 1, y: -30, opacity: 0 }} transition={{ duration: 1, delay: 0.2 }}>❤️</motion.text>
                    </motion.g>
                )}
            </svg>
        </div>
    );
};

export default InteractivePetRenderer;
