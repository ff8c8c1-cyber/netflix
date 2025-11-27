import React from 'react';
import { Home, ShoppingBag, Users, User, Heart, Clock, Menu, Zap, Dog, Swords, Video, X, Crown, UserCircle, Flame, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { authService } from '../lib/services/authService';
import { useGameStore } from '../store/useGameStore';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();
    const { user, setUser } = useGameStore();

    const handleLogout = async () => {
        const result = await authService.logout();
        if (result.success) {
            setUser(null);
            navigate('/login');
        }
    };

    const navItems = [
        { id: 'home', label: 'Trang Chủ', icon: Home, path: '/' },
        { id: 'market', label: 'Vạn Bảo Lâu', icon: ShoppingBag, path: '/market' },
        { id: 'alchemy', label: 'Luyện Đan', icon: Flame, path: '/alchemy' },
        { id: 'cultivation', label: 'Tu Luyện', icon: Zap, path: '/cultivation' },
        { id: 'pet', label: 'Linh Thú', icon: Dog, path: '/pet' },
        { id: 'pvp', label: 'Thách Đấu', icon: Swords, path: '/pvp' },
        { id: 'sect', label: 'Tông Môn', icon: Users, path: '/sect' },
        { id: 'vip', label: 'VIP', icon: Crown, path: '/vip' },
        { id: 'character', label: 'Nhân Vật 3D', icon: UserCircle, path: '/character' },
        { id: 'watch-party', label: 'Xem Chung', icon: Video, path: '/watch-party/default' },
        { id: 'profile', label: 'Động Phủ', icon: User, path: '/profile' },
    ];


    return (
        <>
            {/* Mobile Hamburger Button - Fixed top-left */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 md:hidden bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-xl text-white hover:bg-white/10 transition-all shadow-lg"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Backdrop Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "bg-black/60 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col z-40",
                // Mobile: Fixed position, slide from left
                "fixed top-0 left-0 h-full",
                // Desktop: Static position
                "md:sticky md:top-0",
                // Width and transform
                sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
            )}>
                <div className="h-16 flex items-center justify-center border-b border-white/5">
                    {sidebarOpen ? (
                        <div className="flex items-center gap-2 px-4 w-full">
                            <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">H</span>
                            </div>
                            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">HUYỀN THIÊN</span>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-lg">H</div>
                    )}
                </div>

                <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto">
                    {navItems.map(item => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            onClick={() => {
                                // Close sidebar on mobile after clicking
                                if (window.innerWidth < 768) {
                                    setSidebarOpen(false);
                                }
                            }}
                            className={({ isActive }) => clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                isActive
                                    ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/20 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <item.icon size={22} />
                            {sidebarOpen && <span className="font-medium">{item.label}</span>}
                        </NavLink>
                    ))}

                    <div className="my-6 border-t border-white/10 mx-2"></div>

                    <div className="px-4 text-xs font-bold text-gray-500 uppercase mb-2">{sidebarOpen ? 'Thư Viện' : '...'}</div>
                    <NavLink
                        to="/favorites"
                        onClick={() => {
                            if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className={({ isActive }) => clsx(
                            "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
                            isActive ? 'text-red-400 bg-red-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5',
                            !sidebarOpen && 'justify-center'
                        )}
                    >
                        <Heart size={20} /> {sidebarOpen && <span>Yêu Thích</span>}
                    </NavLink>
                    <NavLink
                        to="/history"
                        onClick={() => {
                            if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className={({ isActive }) => clsx(
                            "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
                            isActive ? 'text-cyan-400 bg-cyan-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5',
                            !sidebarOpen && 'justify-center'
                        )}
                    >
                        <Clock size={20} /> {sidebarOpen && <span>Lịch Sử</span>}
                    </NavLink>
                </nav>
                import React from 'react';
                import {Home, ShoppingBag, Users, User, Heart, Clock, Menu, Zap, Dog, Swords, Video, X, Crown, UserCircle, Flame, LogOut} from 'lucide-react';
                import {NavLink, useNavigate} from 'react-router-dom';
                import clsx from 'clsx';
                import {authService} from '../lib/services/authService';
                import {useGameStore} from '../store/useGameStore';

                const Sidebar = ({sidebarOpen, setSidebarOpen}) => {
    const navigate = useNavigate();
                const {user, setUser} = useGameStore();

    const handleLogout = async () => {
        const result = await authService.logout();
                if (result.success) {
                    setUser(null);
                navigate('/login');
        }
    };

                const navItems = [
                {id: 'home', label: 'Trang Chủ', icon: Home, path: '/' },
                {id: 'market', label: 'Vạn Bảo Lâu', icon: ShoppingBag, path: '/market' },
                {id: 'alchemy', label: 'Luyện Đan', icon: Flame, path: '/alchemy' },
                {id: 'cultivation', label: 'Tu Luyện', icon: Zap, path: '/cultivation' },
                {id: 'pet', label: 'Linh Thú', icon: Dog, path: '/pet' },
                {id: 'pvp', label: 'Thách Đấu', icon: Swords, path: '/pvp' },
                {id: 'sect', label: 'Tông Môn', icon: Users, path: '/sect' },
                {id: 'vip', label: 'VIP', icon: Crown, path: '/vip' },
                {id: 'character', label: 'Nhân Vật 3D', icon: UserCircle, path: '/character' },
                {id: 'watch-party', label: 'Xem Chung', icon: Video, path: '/watch-party/default' },
                {id: 'profile', label: 'Động Phủ', icon: User, path: '/profile' },
                ];


                return (
                <>
                    {/* Mobile Hamburger Button - Fixed top-left */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="fixed top-4 left-4 z-50 md:hidden bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-xl text-white hover:bg-white/10 transition-all shadow-lg"
                    >
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Mobile Backdrop Overlay */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    <aside className={clsx(
                        "bg-black/60 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col z-40",
                        // Mobile: Fixed position, slide from left
                        "fixed top-0 left-0 h-full",
                        // Desktop: Static position
                        "md:sticky md:top-0",
                        // Width and transform
                        sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
                    )}>
                        <div className="h-16 flex items-center justify-center border-b border-white/5">
                            {sidebarOpen ? (
                                <div className="flex items-center gap-2 px-4 w-full">
                                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-lg">H</span>
                                    </div>
                                    <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">HUYỀN THIÊN</span>
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-lg">H</div>
                            )}
                        </div>

                        <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    onClick={() => {
                                        // Close sidebar on mobile after clicking
                                        if (window.innerWidth < 768) {
                                            setSidebarOpen(false);
                                        }
                                    }}
                                    className={({ isActive }) => clsx(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                        isActive
                                            ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/20 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    <item.icon size={22} />
                                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                                </NavLink>
                            ))}

                            <div className="my-6 border-t border-white/10 mx-2"></div>

                            <div className="px-4 text-xs font-bold text-gray-500 uppercase mb-2">{sidebarOpen ? 'Thư Viện' : '...'}</div>
                            <NavLink
                                to="/favorites"
                                onClick={() => {
                                    if (window.innerWidth < 768) setSidebarOpen(false);
                                }}
                                className={({ isActive }) => clsx(
                                    "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
                                    isActive ? 'text-red-400 bg-red-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5',
                                    !sidebarOpen && 'justify-center'
                                )}
                            >
                                <Heart size={20} /> {sidebarOpen && <span>Yêu Thích</span>}
                            </NavLink>
                            <NavLink
                                to="/history"
                                onClick={() => {
                                    if (window.innerWidth < 768) setSidebarOpen(false);
                                }}
                                className={({ isActive }) => clsx(
                                    "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
                                    isActive ? 'text-cyan-400 bg-cyan-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5',
                                    !sidebarOpen && 'justify-center'
                                )}
                            >
                                <Clock size={20} /> {sidebarOpen && <span>Lịch Sử</span>}
                            </NavLink>
                        </nav>

                        {/* Logout Button */}
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="mt-auto mx-4 mb-4 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group border border-red-500/20 hover:border-red-500/50"
                            >
                                <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                                {sidebarOpen && <span className="font-medium">Đăng Xuất</span>}
                            </button>
                        )}

                        {/* Toggle button - Only show on desktop */}
                        <div className="p-4 border-t border-white/5 hidden md:block">
                            <div
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="flex items-center justify-center p-2 rounded-lg hover:bg-white/5 cursor-pointer text-gray-500 hover:text-white transition-colors"
                            >
                                <Menu size={20} />
                            </div>
                        </div>
                    </aside>
                </>
                );
};

                export default Sidebar;
