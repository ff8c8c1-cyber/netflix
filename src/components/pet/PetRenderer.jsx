import React, { useMemo } from 'react';

const COLORS = {
    'Fire': { primary: '#ef4444', secondary: '#b91c1c', accent: '#fca5a5', glow: 'rgba(239, 68, 68, 0.5)' },
    'Water': { primary: '#3b82f6', secondary: '#1d4ed8', accent: '#93c5fd', glow: 'rgba(59, 130, 246, 0.5)' },
    'Thunder': { primary: '#eab308', secondary: '#a16207', accent: '#fde047', glow: 'rgba(234, 179, 8, 0.5)' },
    'Wood': { primary: '#22c55e', secondary: '#15803d', accent: '#86efac', glow: 'rgba(34, 197, 94, 0.5)' },
    'Earth': { primary: '#a8a29e', secondary: '#57534e', accent: '#d6d3d1', glow: 'rgba(168, 162, 158, 0.5)' },
    'Light': { primary: '#fef08a', secondary: '#facc15', accent: '#ffffff', glow: 'rgba(254, 240, 138, 0.5)' },
};

const PetRenderer = ({ species, element, tier, mood = 'Normal' }) => {
    const colors = COLORS[element] || COLORS['Fire'];

    // Animation Styles
    const animStyle = {
        animation: `float 3s ease-in-out infinite, breathe 4s ease-in-out infinite`
    };

    // Procedural Parts Generation
    const parts = useMemo(() => {
        // This is where we would have complex logic to assemble parts based on species/tier
        // For prototype, we return a "Dragon" structure
        return {
            body: (
                <path
                    d="M50 60 Q 30 80 20 120 Q 10 160 30 180 Q 60 200 90 180 Q 110 160 100 120 Q 90 80 70 60"
                    fill={colors.primary}
                    stroke={colors.secondary}
                    strokeWidth="3"
                />
            ),
            belly: (
                <path
                    d="M45 80 Q 35 120 45 160 Q 60 170 75 160 Q 85 120 75 80"
                    fill={colors.accent}
                    opacity="0.8"
                />
            ),
            head: (
                <g transform="translate(60, 50)">
                    <ellipse cx="0" cy="0" rx="30" ry="25" fill={colors.primary} stroke={colors.secondary} strokeWidth="3" />
                    {/* Eyes */}
                    <circle cx="-12" cy="-5" r="5" fill="white" />
                    <circle cx="-12" cy="-5" r="2" fill="black" />
                    <circle cx="12" cy="-5" r="5" fill="white" />
                    <circle cx="12" cy="-5" r="2" fill="black" />
                    {/* Horns (Tier 1+) */}
                    {tier >= 1 && (
                        <>
                            <path d="M-20 -15 Q -30 -40 -10 -50" fill="none" stroke={colors.secondary} strokeWidth="4" />
                            <path d="M20 -15 Q 30 -40 10 -50" fill="none" stroke={colors.secondary} strokeWidth="4" />
                        </>
                    )}
                    {/* Snout */}
                    <ellipse cx="0" cy="10" rx="12" ry="8" fill={colors.secondary} opacity="0.5" />
                </g>
            ),
            wings: tier >= 2 && (
                <g>
                    <path
                        d="M80 80 Q 150 20 180 60 Q 140 100 90 100"
                        fill={colors.accent}
                        stroke={colors.secondary}
                        strokeWidth="3"
                        opacity="0.9"
                        className="origin-left animate-pulse"
                    />
                    <path
                        d="M40 80 Q -30 20 -60 60 Q -20 100 30 100"
                        fill={colors.accent}
                        stroke={colors.secondary}
                        strokeWidth="3"
                        opacity="0.9"
                        className="origin-right animate-pulse"
                    />
                </g>
            ),
            aura: tier >= 3 && (
                <circle cx="60" cy="100" r="90" fill="url(#auraGradient)" opacity="0.3" className="animate-spin-slow" />
            )
        };
    }, [species, element, tier, colors]);

    if (tier === 0) {
        // Egg View
        return (
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                <defs>
                    <radialGradient id="eggGradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                        <stop offset="0%" stopColor={colors.accent} />
                        <stop offset="100%" stopColor={colors.primary} />
                    </radialGradient>
                </defs>
                <g style={{ animation: 'float 3s ease-in-out infinite' }}>
                    <ellipse cx="100" cy="100" rx="50" ry="70" fill="url(#eggGradient)" stroke={colors.secondary} strokeWidth="2" />
                    {/* Cracks or markings */}
                    <path d="M80 60 L 90 80 L 70 90" fill="none" stroke={colors.secondary} strokeWidth="2" opacity="0.5" />
                </g>
            </svg>
        );
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-2xl overflow-visible">
                <defs>
                    <radialGradient id="auraGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={colors.primary} stopOpacity="0" />
                        <stop offset="100%" stopColor={colors.primary} stopOpacity="0.5" />
                    </radialGradient>
                    <style>
                        {`
                            @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                            @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
                            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                            .animate-spin-slow { transform-origin: center; animation: spin-slow 10s linear infinite; }
                        `}
                    </style>
                </defs>

                <g style={animStyle}>
                    {parts.aura}
                    {parts.wings}
                    {parts.body}
                    {parts.belly}
                    {parts.head}
                </g>
            </svg>
        </div>
    );
};

export default PetRenderer;
