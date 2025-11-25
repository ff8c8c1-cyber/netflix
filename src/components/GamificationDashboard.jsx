import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Award,
    Flame,
    Zap,
    Crown,
    Medal,
    Star,
    TrendingUp,
    Users,
    Target,
    Lock,
    Unlock,
    Check,
    Calendar,
    Clock,
    Gift,
    Coins,
    Dog
} from 'lucide-react';
import { useGameStore, RANKS, MISSIONS } from '../store/useGameStore';
import { watchHistoryService, reviewService } from '../lib/services';

import { API_BASE_URL } from '../config/api';

const GamificationDashboard = () => {
    const { user, fetchUserStats, todayWatchTime, claimedMissions, claimMissionReward } = useGameStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('missions');
    const [leaderboardCategory, setLeaderboardCategory] = useState('level');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            if (!user?.id) return;

            try {
                const userStats = await fetchUserStats();
                setStats({
                    ...userStats,
                    watchHistory: [],
                    reviews: [],
                    achievements: []
                });

                // Load additional data
                const [history, reviews] = await Promise.all([
                    watchHistoryService.getRecentWatched(user.id),
                    Promise.resolve([]) // reviewService.getUserReview(user.id, null) - Temporary fix to avoid 500 error
                ]);

                setStats(prev => ({
                    ...prev,
                    watchHistory: history || [],
                    reviews: reviews || [],
                    achievements: getUserAchievements(history || [], reviews || [])
                }));

            } catch (error) {
                console.error('Error loading user stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [user, fetchUserStats]);

    // Fetch Leaderboard Data
    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLeaderboardLoading(true);
            try {
                let endpoint = '/api/leaderboard/level';
                if (leaderboardCategory === 'stones') endpoint = '/api/leaderboard/wealth';
                if (leaderboardCategory === 'mount') endpoint = '/api/leaderboard/mounts';

                const response = await fetch(`${API_BASE_URL}${endpoint}`);
                const data = await response.json();
                setLeaderboardData(data);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLeaderboardLoading(false);
            }
        };

        if (activeTab === 'leaderboard') {
            fetchLeaderboard();
        }
    }, [leaderboardCategory, activeTab]);

    // Calculate achievements based on activity
    const getUserAchievements = (history, reviews) => {
        const achievements = [];

        // Watching achievements
        if (history.length >= 1) achievements.push({ id: 1, title: 'Người mới bắt đầu', desc: 'Đã xem phim đầu tiên', icon: '🎬', unlocked: true });
        if (history.length >= 5) achievements.push({ id: 2, title: 'Nhà phê bình', desc: 'Đã xem 5 phim', icon: '👀', unlocked: true });
        if (history.length >= 10) achievements.push({ id: 3, title: 'Thiện ý sĩ', desc: 'Đã xem 10 phim', icon: '⭐', unlocked: true });

        // Ranking achievements
        const currentRank = RANKS[user?.rank] || RANKS[0];
        if ((user?.exp || 0) >= (currentRank?.maxExp || 100) * 0.8) {
            achievements.push({ id: 4, title: 'Gần đột phá', desc: 'Sắp lên rank mới', icon: '⚡', unlocked: true });
        }

        // Placeholder for future achievements
        return [
            ...achievements,
            { id: 5, title: 'Chiến Thắng', desc: 'Thắng 100 trận đấu', icon: '🏆', unlocked: false },
            { id: 6, title: 'Tông Chủ', desc: 'Lãnh đạo tông môn', icon: '👑', unlocked: false },
            { id: 7, title: 'Thiên Tài', desc: 'Đạt rank tối cao', icon: '🌟', unlocked: false },
        ];
    };

    const expToNextRank = () => {
        if (!user) return 0;
        const currentRank = RANKS[user.rank] || RANKS[0];
        const nextRank = RANKS[(user.rank || 0) + 1];
        if (!nextRank) return 0;
        return Math.max(0, nextRank.maxExp - user.exp);
    };

    const expProgress = () => {
        if (!user) return 0;
        const currentRank = RANKS[user.rank] || RANKS[0];
        if (!currentRank) return 0;
        return Math.min(100, ((user.exp % 100) / currentRank.maxExp) * 100);
    };

    const tabs = [
        { id: 'missions', label: 'Nhiệm Vụ', icon: Target, count: MISSIONS.filter(m => !claimedMissions.includes(m.id)).length },
        { id: 'achievements', label: 'Thành Tựu', icon: Trophy, count: stats?.achievements?.filter(a => a.unlocked).length || 0 },
        { id: 'leaderboard', label: 'Bảng Xếp Hạng', icon: Crown, count: leaderboardData.length },
        { id: 'stats', label: 'Thống Kê', icon: TrendingUp, count: '-' },
        { id: 'ranking', label: 'Xếp Hạng', icon: Medal, count: user?.rank || 0 },
    ];

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-xl p-6 border border-purple-500/20">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-6">
                <Zap className="text-yellow-400" size={28} />
                <div>
                    <h2 className="text-2xl font-black text-white">Tu Luyện Tiến Độ</h2>
                    <p className="text-purple-300 text-sm">Hành trình tu tiên của bạn</p>
                </div>
            </div>

            {/* User Rank Progress */}
            {user && (
                <div className="mb-6 p-4 bg-black/30 rounded-lg border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full bg-gradient-to-r ${RANKS[user.rank]?.border || 'border-gray-500'}`}>
                                <Flame className={`w-6 h-6 ${RANKS[user.rank]?.color || 'text-gray-400'}`} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">{RANKS[user.rank]?.name || 'Phàm Nhân'}</h3>
                                <p className="text-gray-300 text-sm">
                                    {user.exp} / {RANKS[user.rank]?.maxExp || 100} EXP
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-400">{user.stones.toLocaleString()}</div>
                            <div className="text-gray-300 text-xs">Linh Thạch</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000"
                            style={{ width: `${expProgress()}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{expToNextRank()} EXP để lên rank</span>
                        <span>{RANKS[(user.rank || 0) + 1]?.name || 'MAX'}</span>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${activeTab === tab.id
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-black/30 text-gray-300 hover:bg-black/50 border border-purple-500/20'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                            {tab.count !== '-' && tab.count > 0 && (
                                <span className="bg-cyan-500 text-black px-1.5 py-0.5 rounded-full text-xs font-bold">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* Missions Tab */}
                {activeTab === 'missions' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="text-red-400" />
                            Nhiệm Vụ Hàng Ngày
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {MISSIONS.map((mission) => {
                                const isClaimed = claimedMissions.includes(mission.id);
                                let progress = 0;
                                let isCompleted = false;

                                if (mission.id === 'daily_login') {
                                    progress = 100;
                                    isCompleted = true;
                                } else {
                                    progress = Math.min(100, (todayWatchTime / mission.target) * 100);
                                    isCompleted = todayWatchTime >= mission.target;
                                }

                                return (
                                    <div
                                        key={mission.id}
                                        className={`p-4 rounded-xl border transition-all ${isClaimed
                                            ? 'bg-gray-900/50 border-gray-700 opacity-70'
                                            : isCompleted
                                                ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                : 'bg-gray-800/30 border-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={`p-3 rounded-full ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'
                                                    }`}>
                                                    {mission.id === 'daily_login' ? <Calendar size={24} /> : <Clock size={24} />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`font-bold text-lg ${isCompleted ? 'text-white' : 'text-gray-300'}`}>
                                                        {mission.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-400 mb-2">{mission.desc}</p>

                                                    {/* Progress Bar */}
                                                    {mission.id !== 'daily_login' && (
                                                        <div className="w-full max-w-xs bg-gray-700 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-cyan-500'
                                                                    }`}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                    {mission.id !== 'daily_login' && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {Math.floor(todayWatchTime / 60)} / {mission.target / 60} phút
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <div className={`flex items-center gap-1 font-bold px-2 py-1 rounded ${mission.rewardType === 'mystery_bag' ? 'text-purple-400 bg-purple-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                                                    <Gift size={14} />
                                                    +{mission.reward} {mission.rewardType === 'mystery_bag' ? 'Túi' : ''}
                                                </div>

                                                <button
                                                    onClick={() => claimMissionReward(mission.id)}
                                                    disabled={isClaimed || !isCompleted}
                                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${isClaimed
                                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                        : isCompleted
                                                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 animate-pulse'
                                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {isClaimed ? (
                                                        <>
                                                            <Check size={16} />
                                                            Đã Nhận
                                                        </>
                                                    ) : isCompleted ? (
                                                        <>
                                                            <Gift size={16} />
                                                            Nhận Thưởng
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock size={16} />
                                                            Chưa Đạt
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Achievements */}
                {activeTab === 'achievements' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy className="text-yellow-400" />
                            Thành Tựu Tu Tiên
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats?.achievements?.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className={`p-4 rounded-lg border transition-all ${achievement.unlocked
                                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                                        : 'bg-gray-800/30 border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">{achievement.icon}</span>
                                        <div className="flex-1">
                                            <h4 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                                                {achievement.title}
                                            </h4>
                                            <p className={`text-sm ${achievement.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {achievement.desc}
                                            </p>
                                        </div>
                                        <div className="ml-2">
                                            {achievement.unlocked ? (
                                                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                                            ) : (
                                                <Lock className="w-4 h-4 text-gray-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                {activeTab === 'leaderboard' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Crown className="text-yellow-400" />
                                Bảng Xếp Hạng
                            </h3>

                            {/* Leaderboard Category Selector */}
                            <div className="flex bg-gray-800/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setLeaderboardCategory('level')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${leaderboardCategory === 'level'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Flame size={14} className="inline mr-1" /> Cấp Độ
                                </button>
                                <button
                                    onClick={() => setLeaderboardCategory('stones')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${leaderboardCategory === 'stones'
                                        ? 'bg-yellow-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Coins size={14} className="inline mr-1" /> Linh Thạch
                                </button>
                                <button
                                    onClick={() => setLeaderboardCategory('mount')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${leaderboardCategory === 'mount'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Dog size={14} className="inline mr-1" /> Thú Cưỡi
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {leaderboardLoading ? (
                                <div className="text-center py-8 text-gray-400">Đang tải bảng xếp hạng...</div>
                            ) : leaderboardData.length > 0 ? (
                                leaderboardData.map((entry, index) => (
                                    <div
                                        key={entry.user_id || index}
                                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${index === 0
                                            ? 'bg-gradient-to-r from-gold to-yellow-600/20 border-yellow-500/50'
                                            : index === 1
                                                ? 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-gray-500/30'
                                                : index === 2
                                                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/30'
                                                    : 'bg-gray-800/30 border-gray-600/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${index === 0
                                                ? 'bg-yellow-500 text-black'
                                                : index === 1
                                                    ? 'bg-gray-400 text-black'
                                                    : index === 2
                                                        ? 'bg-orange-500 text-black'
                                                        : 'bg-gray-600 text-white'
                                                }`}>
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium">{entry.username}</h4>
                                                <p className="text-gray-400 text-sm">
                                                    {leaderboardCategory === 'level' && `${RANKS[entry.rank]?.name || 'Phàm Nhân'} • ${entry.exp || 0} EXP`}
                                                    {leaderboardCategory === 'stones' && `${(entry.stones || 0).toLocaleString()} Linh Thạch`}
                                                    {leaderboardCategory === 'mount' && `${entry.mount_count || 0} Thú Cưỡi`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {index <= 2 && (
                                                <Medal
                                                    className={`w-6 h-6 ${index === 0 ? 'text-yellow-400' :
                                                        index === 1 ? 'text-gray-400' :
                                                            'text-orange-400'
                                                        }`}
                                                    fill="currentColor"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">Chưa có dữ liệu xếp hạng</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Statistics */}
                {activeTab === 'stats' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="text-green-400" />
                            Thống Kê Tu Luyện
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-black/30 rounded-lg border border-green-500/20">
                                <div className="flex items-center gap-3">
                                    <Target className="w-8 h-8 text-green-400" />
                                    <div>
                                        <h4 className="text-green-400 font-bold">EXP Thu Nhận</h4>
                                        <p className="text-white text-2xl font-bold">{user?.exp || 0}</p>
                                        <p className="text-gray-400 text-sm">Tổng cộng trong tuần</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-black/30 rounded-lg border border-blue-500/20">
                                <div className="flex items-center gap-3">
                                    <Users className="w-8 h-8 text-blue-400" />
                                    <div>
                                        <h4 className="text-blue-400 font-bold">Thời Gian Xem</h4>
                                        <p className="text-white text-2xl font-bold">{Math.floor(todayWatchTime / 60)}m</p>
                                        <p className="text-gray-400 text-sm">Hôm nay</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-black/30 rounded-lg border border-purple-500/20">
                                <div className="flex items-center gap-3">
                                    <Star className="w-8 h-8 text-purple-400" />
                                    <div>
                                        <h4 className="text-purple-400 font-bold">Đánh Giá</h4>
                                        <p className="text-white text-2xl font-bold">--</p>
                                        <p className="text-gray-400 text-sm">Bình luận đã ghi</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ranking Details */}
                {activeTab === 'ranking' && user && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Medal className="text-purple-400" />
                            Chi Tiết Xếp Hạng
                        </h3>
                        <div className="space-y-4">
                            {RANKS.map((rank, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border ${index <= (user.rank || 0)
                                        ? 'bg-purple-500/20 border-purple-500/40'
                                        : 'bg-gray-800/30 border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${index <= (user.rank || 0)
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-700 text-gray-400'
                                                }`}>
                                                <Crown size={16} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${index <= (user.rank || 0) ? 'text-purple-300' : 'text-gray-400'
                                                    }`}>
                                                    {rank.name}
                                                </h4>
                                                <p className="text-gray-400 text-sm">
                                                    EXP cần: {rank.maxExp.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {index < (user.rank || 0) ? (
                                                <div className="flex items-center gap-1 text-green-400">
                                                    <Check size={16} />
                                                    <span className="text-sm">Đã đạt</span>
                                                </div>
                                            ) : index === (user.rank || 0) ? (
                                                <div className="flex items-center gap-1 text-purple-400">
                                                    <Zap size={16} />
                                                    <span className="text-sm">Hiện tại</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Lock size={16} />
                                                    <span className="text-sm">Chưa đạt</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamificationDashboard;
