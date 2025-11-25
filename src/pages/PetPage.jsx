import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import ThreeDPetRenderer from '../components/pet/ThreeDPetRenderer';
import { Heart, Zap, Shield, Sword, Wind, Flame, Droplets, CloudLightning, Mountain, Sun, Sparkles } from 'lucide-react';

const TIERS = ['Trứng', 'Ấu Linh', 'Linh Thú', 'Thần Thú', 'Thánh Thú', 'Tiên Thú'];

import { API_BASE_URL } from '../config/api';

const PetPage = () => {
    const { activePet, fetchUserPet, hatchPet, feedPet, breakthroughPet, castSkill } = useGameStore();
    const [speciesList, setSpeciesList] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [petName, setPetName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch Species List
                const speciesRes = await fetch(`${API_BASE_URL}/api/pets/species`);
                const speciesData = await speciesRes.json();
                setSpeciesList(speciesData);
                if (speciesData.length > 0) setSelectedSpecies(speciesData[0]);

                // 2. Fetch User Pet
                await fetchUserPet();
            } catch (err) {
                console.error("Failed to load pet data:", err);
                setError("Không thể tải dữ liệu linh thú.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleHatch = async () => {
        if (!petName.trim()) return alert('Vui lòng đặt tên cho linh thú!');
        if (!selectedSpecies) return;

        try {
            await hatchPet(petName, selectedSpecies.id, selectedSpecies.element);
        } catch (err) {
            alert('Ấp trứng thất bại: ' + err.message);
        }
    };

    const handleFeed = async (type) => {
        if (!activePet) return;
        const exp = type === 'food' ? 10 : 0;
        const bond = type === 'play' ? 5 : 2;
        await feedPet(activePet.id, exp, bond);
    };

    const handleBreakthrough = async () => {
        if (!activePet) return;
        const newTier = activePet.tier + 1;
        const newVisualUrl = activePet.visual_url;
        await breakthroughPet(activePet.id, newTier, newVisualUrl);
    };

    const handleCastSkill = (skillName) => {
        useGameStore.setState({ castSkill: skillName });
    };

    if (loading) return <div className="text-white text-center mt-20">Đang tải dữ liệu linh thú...</div>;
    if (error) return <div className="text-red-500 text-center mt-20">{error}</div>;

    // 1. HATCHING SCREEN
    if (!activePet) {
        return (
            <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
                <div className="max-w-2xl w-full bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
                    <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        Triệu Hồi Linh Thú
                    </h1>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Chọn Loài:</label>
                            <div className="grid grid-cols-2 gap-4">
                                {speciesList.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedSpecies(s)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedSpecies?.id === s.id
                                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                                            }`}
                                    >
                                        <div className="font-bold text-lg mb-1">{s.name}</div>
                                        <div className="text-xs text-gray-400">{s.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Hệ (Tự động theo loài):</label>
                            <div className="flex gap-2">
                                {['Hỏa', 'Thủy', 'Lôi', 'Mộc', 'Thổ', 'Quang', 'Băng', 'Tâm'].map((ele) => (
                                    <div
                                        key={ele}
                                        className={`px-3 py-1 rounded-full text-xs border ${selectedSpecies?.element === ele
                                            ? 'border-red-500 text-red-400 bg-red-500/10'
                                            : 'border-slate-700 text-gray-600'
                                            }`}
                                    >
                                        {ele}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Đặt Tên:</label>
                            <input
                                type="text"
                                value={petName}
                                onChange={(e) => setPetName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Nhập tên linh thú..."
                            />
                        </div>

                        <button
                            onClick={handleHatch}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Ấp Trứng Ngay
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. PET VIEWING SCREEN
    const elementInfo = { name: activePet.element, color: '#ef4444' };

    return (
        <div className="h-screen w-full bg-black relative overflow-hidden">
            {/* 3D Background/Scene */}
            <div className="absolute inset-0 z-0">
                <ThreeDPetRenderer
                    species={activePet.species}
                    tier={activePet.tier}
                    isSleeping={activePet.mood === 'Sleepy'}
                    castSkill={castSkill}
                />
            </div>

            {/* UI Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
                {/* Header Stats */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-80">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-red-500/30">
                                🥚
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
                                    {elementInfo.name} Hệ
                                </div>
                                <h2 className="text-4xl font-bold mb-1">{activePet.name}</h2>
                                <p className="text-gray-300 text-lg">
                                    {speciesList.find(s => s.id === activePet.species)?.name || activePet.species} • {TIERS[activePet.tier] || 'Unknown'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-400">Cấp độ</div>
                            <div className="text-3xl font-bold text-cyan-400">{activePet.level}</div>
                        </div>
                    </div>
                </div>

                {/* Interaction Bar */}
                <div className="pointer-events-auto grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                    <button
                        onClick={() => handleFeed('food')}
                        className="bg-black/40 backdrop-blur-md hover:bg-black/60 p-4 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-all group"
                    >
                        <div className="p-3 bg-green-500/20 rounded-full text-green-400 group-hover:scale-110 transition-transform">
                            <Heart size={24} />
                        </div>
                        <span className="font-medium text-white">Cho Ăn</span>
                        <span className="text-xs text-gray-400">+EXP</span>
                    </button>

                    <button className="bg-black/40 backdrop-blur-md hover:bg-black/60 p-4 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-all group">
                        <div className="p-3 bg-blue-500/20 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
                            <Sword size={24} />
                        </div>
                        <span className="font-medium text-white">Tập Luyện</span>
                        <span className="text-xs text-gray-400">+Stats</span>
                    </button>

                    <button
                        onClick={handleBreakthrough}
                        className="bg-black/40 backdrop-blur-md hover:bg-black/60 p-4 rounded-xl border border-white/10 flex flex-col items-center gap-2 transition-all group"
                    >
                        <div className="p-3 bg-purple-500/20 rounded-full text-purple-400 group-hover:scale-110 transition-transform">
                            <Zap size={24} />
                        </div>
                        <span className="font-medium text-white">Đột Phá</span>
                        <span className="text-xs text-gray-400">Nâng Bậc</span>
                    </button>
                </div>

                {/* Right Column: Stats & Details (Absolute Positioned) */}
                <div className="absolute top-8 right-8 w-80 space-y-4 pointer-events-auto">
                    {/* Stats Panel */}
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                            <Shield className="text-cyan-400" />
                            Chỉ Số
                        </h3>
                        <div className="space-y-3">
                            <StatBar label="ATK" value={activePet.stats?.atk || 0} max={200} color="bg-red-500" />
                            <StatBar label="DEF" value={activePet.stats?.def || 0} max={200} color="bg-blue-500" />
                            <StatBar label="HP" value={activePet.stats?.hp || 0} max={1000} color="bg-green-500" />
                            <StatBar label="SPD" value={activePet.stats?.spd || 0} max={150} color="bg-yellow-500" />
                            <StatBar label="CRI" value={activePet.stats?.cri || 0} max={100} suffix="%" color="bg-purple-500" />
                        </div>
                    </div>

                    {/* Skills Panel */}
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                            <Zap className="text-yellow-400" />
                            Kỹ Năng
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {(() => {
                                let skills = [];
                                try {
                                    skills = typeof activePet.skills === 'string' ? JSON.parse(activePet.skills) : (activePet.skills || []);
                                } catch (e) { skills = []; }

                                if (skills.length === 0) return <div className="text-gray-500 italic text-sm">Chưa lĩnh ngộ kỹ năng.</div>;

                                return skills.map((skill, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleCastSkill(skill.name)}
                                        className="w-full text-left bg-white/5 p-3 rounded-lg border border-white/10 flex gap-3 group hover:border-cyan-500 transition-all hover:bg-white/10 active:scale-95"
                                    >
                                        <div className={`p-2 rounded-lg shrink-0 h-fit ${skill.type === 'Passive' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {skill.type === 'Passive' ? <Shield size={16} /> : <Sword size={16} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-cyan-300 text-sm flex items-center gap-2 flex-wrap">
                                                {skill.name}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{skill.desc}</div>
                                        </div>
                                    </button>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatBar = ({ label, value, max, color, suffix = '' }) => (
    <div>
        <div className="flex justify-between text-xs mb-1 text-gray-300">
            <span>{label}</span>
            <span className="font-bold text-white">{value}{suffix}</span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
                className={`h-full ${color}`}
                style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
            />
        </div>
    </div>
);

export default PetPage;
