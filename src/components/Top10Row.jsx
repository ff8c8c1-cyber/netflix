import React from 'react';
import { Crown } from 'lucide-react';
import MovieCard from './MovieCard';
import useScrollContainer from '../hooks/useScrollContainer';

const Top10Row = ({ movies, onPlay }) => {
    const { containerRef, events } = useScrollContainer();

    if (!movies || movies.length === 0) return null;

    return (
        <div className="space-y-6 py-8">
            <div className="px-4 md:px-12 flex items-center gap-3">
                <Crown className="text-yellow-400" size={32} />
                <h2 className="text-3xl font-black text-white tracking-tight">
                    Top 10 Thịnh Hành Hôm Nay
                </h2>
            </div>

            <div
                ref={containerRef}
                {...events}
                className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-8 pt-4 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
            >
                {movies.slice(0, 10).map((movie, index) => (
                    <div key={movie.id} className="flex-shrink-0 snap-center relative group w-[180px] md:w-[240px]">
                        {/* Rank Number */}
                        <div className="absolute -left-4 md:-left-6 top-0 bottom-0 flex items-center justify-center z-10 pointer-events-none">
                            <span className="text-[100px] md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-gray-500 to-gray-900 drop-shadow-lg scale-y-110" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}>
                                {index + 1}
                            </span>
                        </div>

                        {/* Movie Card with offset to clear the number */}
                        <div className="ml-14 md:ml-24 relative z-20 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-2">
                            <MovieCard
                                movie={movie}
                                onClick={() => onPlay(movie)}
                                showMeta={false}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Top10Row;
