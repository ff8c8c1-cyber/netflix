import React, { useState, useEffect } from 'react';
import {
    User, Edit, Save, X, Trophy, Star, Calendar,
    TrendingUp, Bell, Shield, Crown, MapPin,
    Mail, Clock, Award, Play, Loader, Package
} from 'lucide-react';
import { useGameStore, RANKS, SECTS, ITEMS } from '../store/useGameStore';
import { useNavigate } from 'react-router-dom';
import { userService, reviewService, watchHistoryService } from '../lib/services';
import { API_BASE_URL } from '../config/api';
import BuffDisplay from '../components/BuffDisplay';
import ItemInventory from '../components/ItemInventory';
import toast, { Toaster } from 'react-hot-toast';

const ProfilePage = () => {
    const user = useGameStore(state => state.user);
    const updateUserProfile = useGameStore(state => state.updateUserProfile);
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        email: ''
    });
    const [userStats, setUserStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [vipStatus, setVipStatus] = useState('none');
    const [loading, setLoading] = useState(true);
    const [usingItemId, setUsingItemId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const loadUserData = async () => {
            try {
                const [stats, activity, userReviews, userPlaylists, vipData] = await Promise.all([
                    userService.getUserStats(user.id),
                    watchHistoryService.getRecentWatched(user.id, 5),
                    // Reviews would need a different query - simplified
                    Promise.resolve([]),
                    // Playlists would need a query - simplified
                    Promise.resolve([]),
                    // Fetch VIP status
                    fetch(`${API_BASE_URL}/api/vip/status/${user.id}`).then(r => r.json()).catch(() => ({ vipStatus: 'none' }))
                ]);

                setVipStatus(vipData.vipStatus || 'none');

                setUserStats(stats);
                setRecentActivity(activity);
                setReviews(userReviews);
                setPlaylists(userPlaylists);
                setEditForm({
                    username: user.name || '',
                    email: user.email || ''
                });
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setLoading(false);
                    >
                    Về trang chủ
                    </button >
                </div >
            </div >
        );
    }

const handleSaveProfile = async () => {
    try {
        await updateUserProfile(editForm);
        setIsEditing(false);
    } catch (error) {
        console.error('Error updating profile:', error);
    }
};

const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));

    if (diffInDays < 1) return 'Hôm nay';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    return `${Math.floor(diffInDays / 30)} tháng trước`;
};

if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] p-8">
            <div className="animate-pulse space-y-8">
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-4">
                        <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                        <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full p-1">
                            <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                                <img
                                    src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    alt={user.name}
                                    className="w-28 h-28 rounded-full bg-gray-800"
                                    onError={(e) => {
                                        e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
                                    }}
                                />
                            </div>
                        </div>
                        {/* Rank Badge */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${RANKS[user.rank]?.color} bg-gray-900 border border-white/20`}>
                                {RANKS[user.rank]?.name}
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                                        {user.name}
                                    </h1>
                                    {vipStatus !== 'none' && (
                                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${vipStatus === 'lifetime'
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                                            }`}>
                                            <Crown size={16} />
                                            {vipStatus === 'lifetime' ? 'VIP Vĩnh Viễn' : 'VIP'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center gap-2 text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Mail size={16} />
                                        {user.email}
                                    </div>
                                    <div className="hidden md:block">•</div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={16} />
                                        Tham gia {user.created_at ? formatTimeAgo(user.created_at) : 'gần đây'}
                                    </div>
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Edit size={16} />
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>

                        {/* Edit Form */}
                        {isEditing && (
                            <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Tên hiển thị
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.username}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Save size={16} />
                                        Lưu
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditForm({
                                                username: user.name || '',
                                                email: user.email || ''
                                            });
                                        }}
                                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <X size={16} />
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-cyan-400">{user.exp}</div>
                                <div className="text-gray-400 text-sm">EXP</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400">{user.stones.toLocaleString()}</div>
                                <div className="text-gray-400 text-sm">Linh Thạch</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">{user.rank + 1}</div>
                                <div className="text-gray-400 text-sm">Rank</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">15</div>
                                <div className="text-gray-400 text-sm">Sư huynh</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress to Next Rank */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-xl p-6 border border-cyan-500/20 mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-cyan-400" />
                    Tiên Độ Tiến Hóa
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm text-gray-300 mb-1">
                            <span>EXP đến {RANKS[user.rank + 1]?.name}</span>
                            <span>{user.exp} / {RANKS[user.rank]?.maxExp}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000"
                                style={{ width: `${(user.exp / RANKS[user.rank].maxExp) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Buffs */}
            {user && (
                <BuffDisplay userId={user.id} />
            )}

            {/* Inventory */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="text-cyan-400" />
                    Inventory
                </h3>
                {user && (
                    <ItemInventory userId={user.id} onItemUsed={handleItemUsed} />
                )}
            </div>

            {/* 3D Character Preview - REMOVED */}
            {/* <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Crown className="text-cyan-400" />
                            Nhân Vật 3D
                        </h3>
                        <button
                            onClick={() => window.location.href = '/character'}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors text-sm"
                        >
                            Tùy Chỉnh
                        </button>
                    </div>
                    <Avatar3D
                        avatarUrl={user.avatarUrl || 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb'}
                        autoRotate={true}
                        className="h-64"
                    />
                    <p className="text-center text-gray-400 text-sm mt-2">
                        🖱️ Kéo để xoay | ⚡ Dynamic 4D Evolution System
                    </p>
                </div>

                {/* Achievements & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Achievements */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Trophy className="text-yellow-400" />
                        Thành Tựu Đã Đạt Được
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="text-2xl">🎬</div>
                            <div className="flex-1">
                                <div className="text-white font-medium">Người mới bắt đầu</div>
                                <div className="text-gray-400 text-sm">Đã xem phim đầu tiên</div>
                            </div>
                            <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">ĐÃ ĐẠT</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
                            <div className="text-2xl text-gray-500">🏆</div>
                            <div className="flex-1">
                                <div className="text-gray-400 font-medium">Chiến thắng đầu tiên</div>
                                <div className="text-gray-500 text-sm">Thắng 10 trận đấu</div>
                            </div>
                            <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs font-bold">CHƯA ĐẠT</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="text-cyan-400" />
                        Hoạt Động Gần Đây
                    </h3>
                    <div className="space-y-3">
                        {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <Play size={16} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-medium">{activity.movies?.title || 'Bí Tịch'}</div>
                                    <div className="text-gray-400 text-sm flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatTimeAgo(activity.watched_at)}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-6">
                                <Clock size={32} className="text-gray-600 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Chưa có hoạt động nào</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default ProfilePage;
