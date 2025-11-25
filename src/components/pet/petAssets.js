export const PET_ASSETS = {
    'Dragon': {
        type: 'serpentine',
        head: {
            // More organic shape with snout definition
            base: "M100 60 Q 80 50 60 70 Q 50 90 70 100 Q 90 110 110 100 Q 130 110 150 100 Q 160 80 140 70 Q 120 60 100 60",
            snout: "M100 80 Q 110 90 100 100 Q 90 90 100 80",
            // Detailed antlers
            horns: [
                "M70 65 Q 60 40 50 30 M 60 40 L 70 30", // Left
                "M130 65 Q 140 40 150 30 M 140 40 L 130 30" // Right
            ],
            mane: "M60 70 Q 50 80 40 70 Q 50 60 60 70 M140 70 Q 150 80 160 70 Q 150 60 140 70" // Side tufts
        },
        body: {
            // Segmented body parts for sine wave animation
            segments: [
                { size: 40, offset: 0 },
                { size: 35, offset: 20 },
                { size: 30, offset: 40 },
                { size: 25, offset: 60 },
                { size: 20, offset: 80 }
            ],
            tail: "M0 0 Q 20 -10 40 0 L 30 10 Z" // Fin shape
        },
        limbs: "M0 0 Q 10 10 0 20 M -5 20 L 5 20" // Claws
    },
    'Phoenix': {
        type: 'avian',
        head: {
            base: "M100 50 Q 80 50 80 80 Q 100 100 120 80 Q 120 50 100 50",
            beak: "M120 75 L 145 80 L 120 85",
            crest: "M90 55 Q 80 20 110 15 L 100 55"
        },
        body: "M100 80 Q 70 110 100 160 Q 130 110 100 80",
        wings: {
            // Multi-layered feathers
            left: [
                "M80 90 Q 40 50 10 70 Q 40 110 80 100", // Top layer
                "M70 100 Q 30 80 0 110 Q 40 140 70 120" // Bottom layer
            ],
            right: [
                "M120 90 Q 160 50 190 70 Q 160 110 120 100",
                "M130 100 Q 170 80 200 110 Q 160 140 130 120"
            ]
        },
        tail: [
            "M100 160 Q 80 200 60 220", // Left feather
            "M100 160 Q 100 210 100 240", // Center feather
            "M100 160 Q 120 200 140 220" // Right feather
        ]
    },
    'Tiger': {
        type: 'beast',
        head: {
            // Wide, robust head with cheek fur
            base: "M100 60 Q 60 60 60 100 Q 60 120 70 130 Q 100 140 130 130 Q 140 120 140 100 Q 140 60 100 60",
            ears: [
                "M70 70 L 60 40 L 90 65", // Left
                "M130 70 L 140 40 L 110 65" // Right
            ],
            stripes: [
                "M100 65 L 100 80", // Center
                "M80 70 L 90 75", // Left
                "M120 70 L 110 75" // Right
            ],
            cheeks: [
                "M60 100 L 50 110 L 65 115", // Left fluff
                "M140 100 L 150 110 L 135 115" // Right fluff
            ]
        },
        body: "M80 110 Q 60 150 70 190 Q 100 200 130 190 Q 140 150 120 110",
        tail: "M100 180 Q 140 180 140 140",
        limbs: {
            front: "M0 0 Q 5 20 0 40",
            paws: "M-10 40 Q 0 50 10 40"
        }
    },
    'Fox': {
        type: 'beast',
        head: {
            // Sleek, triangular head
            base: "M100 70 Q 80 70 85 100 Q 100 120 115 100 Q 120 70 100 70",
            ears: [
                "M85 75 L 75 40 L 95 75", // Left (Tall)
                "M115 75 L 125 40 L 105 75" // Right (Tall)
            ],
            cheeks: [
                "M85 100 L 80 110 L 90 105",
                "M115 100 L 120 110 L 110 105"
            ]
        },
        body: "M90 100 Q 80 140 90 180 Q 110 180 110 180 Q 120 140 110 100",
        // Multi-segment tail for fluid motion
        tail: {
            base: "M100 160 Q 130 150 130 120",
            tip: "M130 120 Q 130 90 100 80"
        }
    }
};
