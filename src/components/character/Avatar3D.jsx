import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';

function AvatarModel({ avatarUrl }) {
    const { scene } = useGLTF(avatarUrl);

    return (
        <primitive
            object={scene}
            scale={1}
            position={[0, -1, 0]}
        />
    );
}

// Loading fallback
function Loader() {
    return (
        <mesh>
            <boxGeometry args={[1, 2, 1]} />
            <meshStandardMaterial color="#4A90E2" />
        </mesh>
    );
}

export default function Avatar3D({
    avatarUrl = 'https://models.readyplayer.me/6538b358e1b3ff34ac2a84e0.glb',
    autoRotate = false,
    showControls = true,
    className = ''
}) {
    return (
        <div className={`w-full h-96 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden ${className}`}>
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: [0, 0, 2.5], fov: 50 }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <spotLight
                    position={[0, 5, 0]}
                    angle={0.3}
                    penumbra={1}
                    intensity={0.5}
                    castShadow
                />

                {/* 3D Model */}
                <Suspense fallback={<Loader />}>
                    <AvatarModel avatarUrl={avatarUrl} />
                    <Environment preset="sunset" />
                </Suspense>

                {/* Ground */}
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, -1, 0]}
                    receiveShadow
                >
                    <planeGeometry args={[10, 10]} />
                    <shadowMaterial opacity={0.3} />
                </mesh>

                {/* Camera Controls */}
                {showControls && (
                    <OrbitControls
                        autoRotate={autoRotate}
                        autoRotateSpeed={2}
                        enableZoom={false}
                        enablePan={false}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 2}
                        target={[0, 0, 0]}
                    />
                )}
            </Canvas>
        </div>
    );
}

// Preload models for better performance
export function preloadAvatar(url) {
    useGLTF.preload(url);
}
