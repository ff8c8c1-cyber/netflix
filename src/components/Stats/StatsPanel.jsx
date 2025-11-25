import React from 'react';
import { Shield, Sword, Zap, Heart, Droplet, Target } from 'lucide-react';

const StatsPanel = ({ stats, buffs = [] }) => {
    if (!stats) return null;

    const { base, total, maxHp, currentHp, maxMp, currentMp } = stats;

    return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Thuộc Tính Tu Vi
            </h3>

            {/* HP & MP Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <StatBar
                    label="Sinh Lực"
                    value={currentHp}
                    max={maxHp}
                    color="red"
                    icon={<Heart className="w-4 h-4" />}
                />
                <StatBar
                    label="Linh Lực"
                    value={currentMp}
                    max={maxMp}
                    color="blue"
                    icon={<Droplet className="w-4 h-4" />}
                />
            </div>

            {/* Combat Stats */}
            <div className="space-y-3 mb-4">
                <StatRow
                    label="Công Kích"
                    base={base?.atk || 0}
                    total={total?.atk || 0}
                    icon={<Sword className="w-4 h-4 text-red-400" />}
                />
                <StatRow
                    label="Phòng Thủ"
                    base={base?.def || 0}
                    total={total?.def || 0}
                    icon={<Shield className="w-4 h-4 text-blue-400" />}
                />
                <StatRow
                    label="Tốc Độ"
                    base={base?.spd || 0}
                    total={total?.spd || 0}
                    icon={<Zap className="w-4 h-4 text-yellow-400" />}
                />
                <StatRow
                    label="Bạo Kích"
                    base={base?.cri || 0}
                    total={total?.cri || 0}
                    suffix="%"
                    icon={<Target className="w-4 h-4 text-purple-400" />}
                />
            </div>

            {/* Active Buffs */}
            {buffs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-sm text-gray-400 mb-2">
                        Hiệu Ứng Đang Hoạt Động ({buffs.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {buffs.slice(0, 6).map((buff, idx) => (
                            <BuffBadge key={idx} buff={buff} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// HP/MP Bar Component
const StatBar = ({ label, value, max, color, icon }) => {
    const percentage = Math.min((value / max) * 100, 100);

    const colorClasses = {
        red: 'bg-red-500',
        blue: 'bg-blue-500'
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300 flex items-center gap-1">
                    {icon}
                    {label}
                </span>
                <span className="text-sm font-bold text-white">
                    {value}/{max}
                </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClasses[color]} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Stat Row Component
const StatRow = ({ label, base, total, suffix = '', icon }) => {
    const buffed = total > base;

    return (
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
            <span className="text-sm text-gray-300 flex items-center gap-2">
                {icon}
                {label}
            </span>
            <div className="flex items-center gap-2">
                {buffed && (
                    <span className="text-xs text-gray-500 line-through">
                        {base}{suffix}
                    </span>
                )}
                <span className={`font-bold ${buffed ? 'text-green-400' : 'text-white'}`}>
                    {total}{suffix}
                </span>
                {buffed && (
                    <span className="text-xs text-green-400">
                        +{total - base}{suffix}
                    </span>
                )}
            </div>
        </div>
    );
};

// Buff Badge Component
const BuffBadge = ({ buff }) => {
    const getBuffIcon = (type) => {
        const icons = {
            atk: '⚔️',
            def: '🛡️',
            spd: '⚡',
            cri: '💥',
            exp: '📈'
        };
        return icons[type] || '✨';
    };

    return (
        <div className="px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center gap-1 text-xs">
            <span>{getBuffIcon(buff.buffType)}</span>
            <span className="text-purple-300 font-semibold">
                {buff.buffType.toUpperCase()} +{buff.buffValue}{buff.isPercentage ? '%' : ''}
            </span>
        </div>
    );
};

export default StatsPanel;
