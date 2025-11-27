{ sidebarOpen ? <X size={24} /> : <Menu size={24} /> }
        </button >

    {/* Mobile Backdrop Overlay */ }
{
    sidebarOpen && (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
        />
    )
}

{/* Sidebar */ }
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
