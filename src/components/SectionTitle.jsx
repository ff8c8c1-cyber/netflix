import React from 'react';
import { ChevronRight, Sparkles, TrendingUp, Star, Play } from 'lucide-react';

// Icon mapping for different categories
const categoryIcons = {
    'trending': TrendingUp,
    'new': Star,
    '3d': Play,
    'action': Play,
    'featured': Sparkles,
    'huyền huyễn': Sparkles,
    'hành động': TrendingUp,
    'khoa học viễn tưởng': Star,
    'hài hước': Play
};

const SectionTitle = ({ category, title }) => {
    const displayTitle = title || category?.title || category?.id || '';
    const Icon = categoryIcons[category?.id || category] || Sparkles;

    return (
        <div className="flex items-center justify-between mb-6 px-6">
            <div className="flex items-center gap-3">
                <Icon size={24} className="text-cyan-400" />
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    {displayTitle}
                </h2>
            </div>
            <button className="hidden md:flex text-sm text-cyan-400 hover:text-white flex items-center gap-2 transition-colors hover-lift px-3 py-1">
                Xem tất cả <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default SectionTitle;
