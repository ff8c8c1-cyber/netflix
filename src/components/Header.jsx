
import React, { useState } from 'react';
import { Search, Sparkles, Database, Bell, LogIn, LogOut, User, Zap } from 'lucide-react';
import { useGameStore, RANKS } from '../store/useGameStore';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import NotificationsPanel from './NotificationsPanel';
import BreakthroughModal from './BreakthroughModal';

const Header = () => {
    const user = useGameStore(state => state.user);
    const logout = useGameStore(state => state.logout);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showBreakthroughModal, setShowBreakthroughModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [showNotifications, setShowNotifications] = useState(false);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleAuthClick = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    return (
        <>
            <header className="h-16 flex items-center justify-between px-8 bg-black/20 backdrop-blur-sm z-30 sticky top-0">
                {/* Search */}
                <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-96 focus-within:border-cyan-500/50 focus-within:bg-black/40 transition-all">
                    <Search size={18} className="text-gray-500 mr-3 cursor-pointer" onClick={handleSearch} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bí tịch, phim 3D, đạo hữu..."
                        className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                </div>

                {/* User Status */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            {/* Breakthrough Button */}
                            {user.is_breakthrough_ready && (
                                <button
                                    onClick={() => setShowBreakthroughModal(true)}
                                    className="hidden md:flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold animate-pulse hover:scale-105 transition-transform"
                                >
                                    <Zap size={16} fill="currentColor" />
                                    ĐỘT PHÁ
                                </button>
                            )}

                            {/* Cultivation Progress - Mini */}
                            <div className="hidden lg:flex flex-col items-end mr-4">
                                <div className={`text-sm font-bold ${RANKS[user.rank]?.color || 'text-gray-400'} flex items-center gap-1`}>
                                    <Sparkles size={12} /> {RANKS[user.rank]?.name || 'Vô Danh'}
                                </div>
                                <div className="w-32 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                                        style={{ width: `${(user.exp / (RANKS[user.rank]?.maxExp || 100)) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stones */}
                            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full text-yellow-400 text-sm font-bold cursor-pointer hover:bg-yellow-500/20 transition-colors">
                                <Database size={14} className="animate-pulse" /> {user.stones.toLocaleString()}
                            </div>

                            {/* Noti */}
                            <div className="relative cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => setShowNotifications(!showNotifications)}>
                                <Bell size={22} />
                                {user.notifications > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0a0a0a]">
                                        {user.notifications}
                                    </span>
                                )}
                            </div>

                            {/* Avatar & Menu */}
                            <div className="relative group">
                                <div
                                    onClick={() => navigate('/profile')}
                                    className="w-10 h-10 rounded-full border-2 border-cyan-500/50 p-0.5 cursor-pointer hover:scale-105 transition-transform"
                                >
                                    <img
                                        src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                        alt="User"
                                        className="w-full h-full rounded-full bg-gray-800"
                                        onError={(e) => {
                                            e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
                                        }}
                                    />
                                </div>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-12 bg-gray-900 border border-gray-700 rounded-lg py-2 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="px-3 py-2 border-b border-gray-700">
                                        <div className="text-white font-medium">{user.name}</div>
                                        <div className="text-gray-400 text-sm">{RANKS[user.rank]?.name || 'Vô Danh'}</div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-2"
                                    >
                                        <User size={16} />
                                        Hồ sơ của bạn
                                    </button>
                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Login/Signup Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleAuthClick('login')}
                                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => handleAuthClick('signup')}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Notifications Panel */}
            {showNotifications && (
                <NotificationsPanel onClose={() => setShowNotifications(false)} />
            )}

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    initialMode={authMode}
                />
            )}

            {/* Breakthrough Modal */}
            {showBreakthroughModal && (
                <BreakthroughModal onClose={() => setShowBreakthroughModal(false)} />
            )}
        </>
    );
};

export default Header;
