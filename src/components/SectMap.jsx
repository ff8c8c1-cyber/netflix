import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder paths - assume images are moved to public/assets/sect/
const ASSETS = {
    background: '/assets/sect/sect_map_background.png',
    MainHall: '/assets/sect/sect_building_main_hall.png',
    Pavilion: '/assets/sect/sect_building_pavilion.png',
    Alchemy: '/assets/sect/sect_building_alchemy.png',
    Vein: '/assets/sect/sect_building_vein.png',
    Mission: '/assets/sect/sect_building_mission.png',
};

// Building Positions (Percentage based for responsiveness)
const POSITIONS = {
    MainHall: { top: '20%', left: '40%', width: '20%' },
    Pavilion: { top: '40%', left: '15%', width: '15%' },
    Alchemy: { top: '45%', left: '70%', width: '15%' },
    Vein: { top: '65%', left: '25%', width: '18%' },
    Mission: { top: '60%', left: '55%', width: '15%' },
};

const SectMap = ({ buildings, onSelectBuilding }) => {
    const [hovered, setHovered] = useState(null);

    return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-yellow-600/50 shadow-2xl bg-black">
            {/* Background */}
            <img
                src={ASSETS.background}
                alt="Sect Map"
                className="absolute inset-0 w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-[10s]"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

            {/* Buildings */}
            {buildings.map(b => (
                <motion.div
                    key={b.Type}
                    className="absolute cursor-pointer group"
                    style={POSITIONS[b.Type]}
                    whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
                    onClick={() => onSelectBuilding(b.Type)}
                    onMouseEnter={() => setHovered(b)}
                    onMouseLeave={() => setHovered(null)}
                >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Building Sprite */}
                    <img
                        src={ASSETS[b.Type]}
                        alt={b.Type}
                        className="relative z-10 drop-shadow-2xl"
                    />

                    {/* Level Badge */}
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-blue-400 z-20">
                        Lv.{b.Level}
                    </div>

                    {/* Name Label (Always visible or hover?) */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded border border-yellow-600/30 opacity-80 group-hover:opacity-100 transition-opacity">
                        {b.Type === 'MainHall' ? 'Đại Điện' :
                            b.Type === 'Pavilion' ? 'Tàng Kinh Các' :
                                b.Type === 'Alchemy' ? 'Đan Dược' :
                                    b.Type === 'Vein' ? 'Linh Mạch' : 'Nhiệm Vụ'}
                    </div>
                </motion.div>
            ))}

            {/* Tooltip / Info Panel */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-4 left-4 bg-black/80 border border-yellow-500/50 p-4 rounded-xl max-w-xs backdrop-blur-md z-30"
                    >
                        <h3 className="text-lg font-bold text-yellow-400 mb-1">
                            {hovered.Type === 'MainHall' ? 'Đại Điện' :
                                hovered.Type === 'Pavilion' ? 'Tàng Kinh Các' :
                                    hovered.Type === 'Alchemy' ? 'Đan Dược Đường' :
                                        hovered.Type === 'Vein' ? 'Linh Mạch' : 'Nhiệm Vụ Đường'}
                        </h3>
                        <p className="text-xs text-gray-300">
                            {hovered.Type === 'MainHall' ? 'Trung tâm quản lý tông môn.' :
                                hovered.Type === 'Pavilion' ? 'Nơi lưu trữ bí kíp võ công.' :
                                    hovered.Type === 'Alchemy' ? 'Chế tạo đan dược thần kỳ.' :
                                        hovered.Type === 'Vein' ? 'Sản sinh Linh Thạch tự động.' : 'Nhận nhiệm vụ kiếm cống hiến.'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SectMap;
