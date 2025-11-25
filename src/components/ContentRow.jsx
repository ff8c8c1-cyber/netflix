import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import SectionTitle from './SectionTitle';
import useScrollContainer from '../hooks/useScrollContainer';

const ContentRow = ({ title, movies, onPlay, isLarge = false }) => {
    const { containerRef, events } = useScrollContainer();

    const scroll = (direction) => {
        if (containerRef.current) {
            const { current } = containerRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth + 200 : current.offsetWidth - 200;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!movies || movies.length === 0) return null;

    return (
        <div className="space-y-4 group relative">
            <div className="px-4 md:px-12">
                <SectionTitle category={{ title }} />
            </div>

            <div className="relative">
                {/* Left Scroll Button */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm border-r border-white/10"
                >
                    <ChevronLeft size={32} />
                </button>

                {/* Movie List */}
                <div
                    ref={containerRef}
                    {...events}
                    className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-8 pt-2 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
                >
                    {movies.map((movie) => (
                        <div key={movie.id} className={`flex-shrink-0 snap-center ${isLarge ? 'w-[200px] md:w-[280px]' : 'w-[160px] md:w-[220px]'}`}>
                            <MovieCard
                                movie={movie}
                                onClick={() => onPlay(movie)}
                            />
                        </div>
                    ))}
                </div>

                {/* Right Scroll Button */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm border-l border-white/10"
                >
                    <ChevronRight size={32} />
                </button>
            </div>
        </div>
    );
};

export default ContentRow;
