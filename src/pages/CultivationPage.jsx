import React from 'react';
import GamificationDashboard from '../components/GamificationDashboard';

const CultivationPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a0a0a] p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Động Thiên Phúc Địa
                    </h1>
                    <p className="text-gray-400">Nơi tu luyện và kiểm tra tiến độ đạo hạnh</p>
                </div>

                <GamificationDashboard />
            </div>
        </div>
    );
};

export default CultivationPage;
