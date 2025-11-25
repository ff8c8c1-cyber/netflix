import React, { useState, useEffect } from 'react';
import { Zap, Heart, Shield, Wind, Clock } from 'lucide-react';

export default function BuffDisplay({ userId }) {
    const [buffs, setBuffs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchBuffs();
            // Refresh every 10 seconds
            const interval = setInterval(fetchBuffs, 10000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const fetchBuffs = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/${userId}/buffs`);
            const data = await response.json();
            setBuffs(data.buffs || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching buffs:', error);
            setLoading(false);
        }
    };

    const getBuffIcon = (type) => {
        switch (type) {
            case 'hp': return <Heart className="text-red-400" size={20} />;
            case 'atk': return <Zap className="text-yellow-400" size={20} />;
            case 'def': return <Shield className="text-blue-400" size={20} />;
            case 'spd': return <Wind className="text-green-400" size={20} />;
            default: return <Zap className="text-purple-400" size={20} />;
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return 'Permanent';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="text-gray-400 text-sm">Loading buffs...</div>;
    if (buffs.length === 0) return null;

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Zap className="text-yellow-400" />
                Active Buffs
            </h3>

            <div className="space-y-2">
                {buffs.map((buff) => (
                    <div
                        key={buff.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                {getBuffIcon(buff.type)}
                            </div>
                            <div>
                                <div className="text-white font-medium">
                                    {buff.type.toUpperCase()} +{buff.value}{buff.isPercentage ? '%' : ''}
                                </div>
                                {buff.itemName && (
                                    <div className="text-gray-400 text-xs">
                                        {buff.itemName}
                                    </div>
                                )}
                            </div>
                        </div>

                        {buff.remainingSeconds !== null && (
                            <div className="flex items-center gap-2 text-cyan-400 text-sm">
                                <Clock size={14} />
                                <span className="font-mono">{formatTime(buff.remainingSeconds)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
