import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-gray-200 font-sans overflow-hidden selection:bg-cyan-500/30">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#020617]">
                <Header />
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
export default MainLayout;
