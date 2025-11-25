import React, { useState } from 'react';
import { Crown, RefreshCw, Settings } from 'lucide-react';
import Avatar3D from '../components/character/Avatar3D';

const CharacterPage = () => {
    const [user, setUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState('https://models.readyplayer.me/6538b358e1b3ff34ac2a84e0.glb');
    const [autoRotate, setAutoRotate] = useState(true);
    const [loading, setLoading] = useState(false);

    // Sample avatar URLs for testing
    const sampleAvatars = [
        'https://models.readyplayer.me/6538b358e1b3ff34ac2a84e0.glb',
        'https://models.readyplayer.me/654b6c0e13a2ba6fd645c6a7.glb',
        'https://models.readyplayer.me/654b6d7213a2ba6fd645c6f5.glb',
    ];

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            // Load user's avatar if exists
            if (u.avatarUrl) {
                setAvatarUrl(u.avatarUrl);
            }
        }
    }, []);

    const handleCreateAvatar = () => {
        // Open Ready Player Me creator in new tab
        window.open('https://readyplayer.me/avatar', '_blank');
        alert('Tạo avatar của bạn trên Ready Player Me.\nSau khi tạo xong, copy URL .glb và paste vào đây!');
    };

    const handleRandomAvatar = () => {
        const random = sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)];
        setAvatarUrl(random);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] p-4 md:p-8 ml-0 md:ml-64">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                        3D Character Preview
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Xem nhân vật 3D của bạn với công nghệ "4D Evolution System"
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 3D Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-white">Your Character</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAutoRotate(!autoRotate)}
                                        className={`p-2 rounded-lg transition-colors ${autoRotate
                                                ? 'bg-cyan-600 text-white'
                                                : 'bg-gray-700 text-gray-300'
                                            }`}
                                        title="Auto Rotate"
                                    >
                                        <RefreshCw size={20} />
                                    </button>
                                    <button
                                        onClick={handleRandomAvatar}
                                        className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                                        title="Random Avatar"
                                    >
                                        <Settings size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* 3D Canvas */}
                            <Avatar3D
                                avatarUrl={avatarUrl}
                                autoRotate={autoRotate}
                                showControls={true}
                            />

                            <div className="mt-4 text-center text-gray-400 text-sm">
                                🖱️ Kéo để xoay | 📱 Vuốt để xoay | ⚙️ Zoom bị tắt
                            </div>
                        </div>
                    </div>

                    {/* Controls & Info */}
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Crown className="text-yellow-400" />
                                Character Info
                            </h3>

                            {user ? (
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-gray-400 text-sm">Name</div>
                                        <div className="text-white font-bold">{user.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Rank</div>
                                        <div className="text-cyan-400 font-bold">Rank {user.rank || 1}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Level</div>
                                        <div className="text-purple-400 font-bold">Level {user.level || 1}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-400">
                                    Đăng nhập để xem thông tin
                                </div>
                            )}
                        </div>

                        {/* Customization */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Customization</h3>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCreateAvatar}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white px-4 py-3 rounded-lg font-bold transition-all"
                                >
                                    🎨 Create Custom Avatar
                                </button>

                                <button
                                    onClick={handleRandomAvatar}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                                >
                                    🎲 Random Avatar
                                </button>

                                <div className="pt-3 border-t border-gray-700">
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Avatar URL (.glb)
                                    </label>
                                    <input
                                        type="text"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                                        placeholder="https://models.readyplayer.me/..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features Info */}
                        <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-3">✨ Features</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>✅ Full 3D character model</li>
                                <li>✅ 360° rotation</li>
                                <li>✅ Real-time rendering</li>
                                <li>✅ Custom avatars (Ready Player Me)</li>
                                <li>⏳ Equipment visualization (coming)</li>
                                <li>⏳ Animations (coming)</li>
                                <li>⏳ Particle effects (coming)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterPage;
