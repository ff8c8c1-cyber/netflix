import React from 'react';
import { Home, ShoppingBag, Users, User, Heart, Clock, Menu, Zap, Dog, Swords, Video } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navItems = [
        { id: 'home', label: 'Trang Chủ', icon: Home, path: '/' },
        { id: 'market', label: 'Vạn Bảo Lâu', icon: ShoppingBag, path: '/market' },
        { id: 'cultivation', label: 'Tu Luyện', icon: Zap, path: '/cultivation' },
        { id: 'pet', label: 'Linh Thú', icon: Dog, path: '/pet' },
        { id: 'pvp', label: 'Thách Đấu', icon: Swords, path: '/pvp' },
        { id: 'sect', label: 'Tông Môn', icon: Users, path: '/sect' },
        { id: 'watch-party', label: 'Xem Chung', icon: Video, path: '/watch-party/default' },
        { id: 'profile', label: 'Động Phủ', icon: User, path: '/profile' },
    ];

    return (
        <aside className={clsx(
            "bg-black/60 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col z-40 relative",
            sidebarOpen ? 'w-64' : 'w-20'
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

            <nav className="flex-1 py-6 space-y-2 px-3">
                {navItems.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                            isActive
                                ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/20 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <item.icon size={22} />
                        {sidebarOpen && <span className="font-medium">{item.label}</span>}
                        {/* Active Indicator handled by NavLink styling usually, but we can add the dot if needed */}
                    </NavLink>
                ))}

                <div className="my-6 border-t border-white/10 mx-2"></div>

                <div className="px-4 text-xs font-bold text-gray-500 uppercase mb-2">{sidebarOpen ? 'Thư Viện' : '...'}</div>
                <NavLink
                    to="/favorites"
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
                    className={({ isActive }) => clsx(
                        "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
                        isActive ? 'text-cyan-400 bg-cyan-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5',
                        !sidebarOpen && 'justify-center'
                    )}
                >
                    <Clock size={20} /> {sidebarOpen && <span>Lịch Sử</span>}
                </NavLink>
            </nav>

            <div className="p-4 border-t border-white/5">
                <div
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex items-center justify-center p-2 rounded-lg hover:bg-white/5 cursor-pointer text-gray-500 hover:text-white transition-colors"
                >
                    <Menu size={20} />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
