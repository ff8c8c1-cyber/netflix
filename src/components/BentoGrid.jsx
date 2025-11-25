import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';

const BentoGrid = ({ title, movies, onPlay }) => {
    if (!movies || movies.length === 0) return null;

    return (
        <div className="py-16 px-4 md:px-16 max-w-[1800px] mx-auto">
            <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold text-white mb-12 tracking-tight"
            >
                {title} <span className="text-cyan-500">.</span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px]">
                {movies.slice(0, 7).map((movie, index) => {
                    // First item is large (2x2)
                    const isLarge = index === 0;
                    const isWide = index === 3 || index === 6;

                    return (
                        <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative group rounded-3xl overflow-hidden cursor-pointer bg-gray-900 ${isLarge ? 'md:col-span-2 md:row-span-2' :
                                    isWide ? 'md:col-span-2' : ''
                                }`}
                            onClick={() => onPlay(movie)}
                        >
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url('${movie.cover_image || movie.cover}')` }}
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs text-white font-bold">
                                            {movie.category || 'Action'}
                                        </span>
                                        <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                            <Star size={12} fill="currentColor" /> {movie.rating}
                                        </span>
                                    </div>

                                    <h3 className={`font-bold text-white leading-tight mb-1 ${isLarge ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
                                        {movie.title}
                                    </h3>

                                    <p className="text-gray-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                        {movie.description}
                                    </p>
                                </div>

                                {/* Play Button (Floating) */}
                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-cyan-500 hover:scale-110">
                                    <Play size={20} fill="white" className="text-white" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default BentoGrid;
