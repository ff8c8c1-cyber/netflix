import React from 'react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';

const InfinitySlider = ({ title, movies, onPlay }) => {
    if (!movies || movies.length === 0) return null;

    // Duplicate movies to create seamless loop
    const sliderMovies = [...movies, ...movies, ...movies];

    return (
        <div className="py-12 overflow-hidden bg-black/50 backdrop-blur-sm border-y border-white/5">
            <div className="px-4 md:px-16 mb-8 flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {title} <span className="text-cyan-500 text-sm font-normal ml-2">Live Updates</span>
                </h2>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse delay-75" />
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-150" />
                </div>
            </div>

            <div className="relative w-full">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />

                <motion.div
                    className="flex gap-6 w-max"
                    animate={{ x: ["0%", "-33.33%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30
                    }}
                >
                    {sliderMovies.map((movie, index) => (
                        <div key={`${movie.id}-${index}`} className="w-[200px] flex-shrink-0 transform hover:scale-105 transition-transform duration-300">
                            <MovieCard
                                movie={movie}
                                onClick={() => onPlay(movie)}
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default InfinitySlider;
