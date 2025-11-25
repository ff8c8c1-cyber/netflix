import React from 'react';
import { Play, Star } from 'lucide-react';

const MovieCard = ({ movie, onClick }) => {
    const formatViews = (views) => {
        if (!views) return '';

        const num = typeof views === 'string' ? parseInt(views) : views;
        if (isNaN(num)) return '';

        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div
            onClick={() => onClick(movie)}
            className="group relative flex-shrink-0 w-48 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
        >
            <div className="aspect-[2/3] rounded-lg bg-slate-800 shadow-lg overflow-hidden relative">
                {/* Movie Poster */}
                <img
                    src={movie.cover_image || movie.cover || `https://api.dicebear.com/7.x/avataaars/svg?seed=${movie.title}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${movie.title}`;
                    }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star size={8} fill="currentColor" />
                    {movie.rating}
                </div>

                {/* Progress Bar (if watching) */}
                {movie.progress && movie.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0">
                        <div className="h-1 bg-black/50 rounded-bl-lg rounded-br-lg overflow-hidden">
                            <div
                                className="h-full bg-cyan-400 transition-all duration-300"
                                style={{ width: `${Math.max(5, (movie.progress / movie.episode_count) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight mb-1">
                        {movie.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-300">
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {formatViews(movie.views)} views
                        </span>
                        <span className="text-gray-400">
                            {movie.episode_count ? `${movie.episode_count} ep` : ''}
                        </span>
                    </div>
                </div>

                {/* Hover Overlay with Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-sm">
                    <div className="bg-cyan-500 hover:bg-cyan-400 rounded-full p-4 shadow-[0_0_20px_rgba(6,182,212,0.8)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play size={28} fill="white" className="text-white ml-1" />
                    </div>
                </div>
            </div>

            {/* Hover Effect Glow */}
            <div className="absolute inset-0 -z-10 bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
        </div>
    );
};

export default MovieCard;
