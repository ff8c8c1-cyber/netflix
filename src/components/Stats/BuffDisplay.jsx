import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { Clock, X } from 'lucide-react';

const BuffDisplay = ({ userId, onBuffUpdate }) => {
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
            const res = await fetch(`${API_BASE_URL}/api/users/${userId}/buffs`);
            const data = await res.json();
            setBuffs(data.buffs || []);
            if (onBuffUpdate) onBuffUpdate(data.buffs);
        } catch (err) {
            console.error('Fetch buffs error:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeBuff = async (buffId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/buffs/${buffId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchBuffs(); // Refresh
            }
        } catch (err) {
            console.error('Remove buff error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (buffs.length === 0) {
        return (
            <div className="text-center p-6 text-gray-500">
                <p className="text-sm">Không có hiệu ứng nào đang hoạt động</p>
                <p className="text-xs mt-1">Sử dụng đan dược để nhận buff</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-300">
                    Hiệu Ứng Đang Hoạt Động
                </h4>
                <span className="text-xs text-gray-500">
                    {buffs.length} buff{buffs.length > 1 ? 's' : ''}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {buffs.map(buff => (
                    <BuffCard
                        key={buff.id}
                        buff={buff}
                        onRemove={removeBuff}
                    />
                ))}
            </div>
        </div>
    );
};

const BuffCard = ({ buff, onRemove }) => {
    const [timeLeft, setTimeLeft] = useState(buff.remainingSeconds);

    useEffect(() => {
        if (buff.expiresAt && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [buff.expiresAt]);

    const getBuffColor = (type) => {
        const colors = {
            atk: 'border-red-500 bg-red-500/10',
            def: 'border-blue-500 bg-blue-500/10',
            spd: 'border-yellow-500 bg-yellow-500/10',
            cri: 'border-purple-500 bg-purple-500/10',
            exp: 'border-green-500 bg-green-500/10',
            hp: 'border-pink-500 bg-pink-500/10',
            mp: 'border-cyan-500 bg-cyan-500/10'
        };
        return colors[type] || 'border-gray-500 bg-gray-500/10';
    };

    const getBuffIcon = (type) => {
        const icons = {
            atk: '⚔️',
            def: '🛡️',
            spd: '⚡',
            cri: '💥',
            exp: '📈',
            hp: '❤️',
            mp: '💧'
        };
        return icons[type] || '✨';
    };

    const formatTime = (seconds) => {
        if (seconds < 0) return 'Vĩnh viễn';
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    };

    const isPermanent = !buff.expiresAt || buff.remainingSeconds < 0;

    return (
        <div className={`relative p-4 rounded-lg border-2 ${getBuffColor(buff.buffType)} transition-all hover:scale-105`}>
            {/* Remove button */}
            <button
                onClick={() => onRemove(buff.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Xóa buff"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Buff info */}
            <div className="flex items-start gap-3">
                <div className="text-3xl">{getBuffIcon(buff.buffType)}</div>
                <div className="flex-1">
                    <div className="font-bold text-white text-lg capitalize">
                        {buff.buffType.toUpperCase()}
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                        +{buff.buffValue}{buff.isPercentage ? '%' : ''}
                    </div>

                    {/* Timer */}
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {isPermanent ? (
                            <span className="text-purple-400">Vĩnh viễn</span>
                        ) : (
                            <span className={timeLeft < 300 ? 'text-orange-400' : ''}>
                                Còn {formatTime(timeLeft)}
                            </span>
                        )}
                    </div>

                    {/* Source */}
                    {buff.sourceType && (
                        <div className="mt-1 text-xs text-gray-500">
                            Nguồn: {buff.sourceType === 'pill' ? '💊 Đan dược' : buff.sourceType}
                        </div>
                    )}
                </div>
            </div>

            {/* Progress bar for time */}
            {!isPermanent && timeLeft > 0 && (
                <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                        style={{
                            width: `${(timeLeft / buff.remainingSeconds) * 100}%`
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default BuffDisplay;
