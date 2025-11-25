import React from 'react';
import { Play, Info, Star, Calendar, Clock, Monitor } from 'lucide-react';

const HeroSection = ({ movie, onPlay, onMoreInfo }) => {
    if (!movie) return null;

    return (
        <div className="relative h-[85vh] w-full group overflow-hidden">
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear group-hover:scale-110"
                    style={{ backgroundImage: `url('${movie.cover_image || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2670&auto=format&fit=crop'}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/60 to-transparent"></div>
            </div>

            {/* Content Container */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-10 flex flex-col justify-end h-full">
                <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                    {/* Metadata Tags */}
                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                        <span className="bg-red-600 text-white px-2 py-1 rounded shadow-lg shadow-red-600/20 tracking-wider font-bold">
                            TOP 1 THỊNH HÀNH
                        </span>
                        <span className="bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                            <Monitor size={14} /> 4K ULTRA HD
                        </span>
                        <span className="text-green-400 font-bold flex items-center gap-1">
                            <Star size={14} fill="currentColor" /> 9.8 Match
                        </span>
                        <span className="text-gray-300">2025</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-300">{movie.category || 'Huyền Huyễn'}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight drop-shadow-2xl tracking-tight">
                        {movie.title}
                    </h1>

                    {/* Description */}
                    <p className="text-gray-200 text-lg md:text-xl line-clamp-3 max-w-2xl drop-shadow-md font-light leading-relaxed">
                        {movie.description || 'Một hành trình đầy cam go và thử thách đang chờ đợi. Liệu ai sẽ là người đứng trên đỉnh vinh quang?'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <button
                            onClick={() => onPlay(movie)}
                            className="group relative bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_40px_rgba(8,145,178,0.6)] hover:-translate-y-1 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <Play fill="currentColor" size={24} />
                            <span className="text-lg">XEM NGAY</span>
                        </button>

                        <button
                            onClick={() => onMoreInfo(movie)}
                            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 backdrop-blur-md border border-white/10 transition-all hover:-translate-y-1"
                        >
                            <Info size={24} />
                            <span className="text-lg">CHI TIẾT</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
