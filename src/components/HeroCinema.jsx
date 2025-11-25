import React from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Star, Monitor, Volume2, VolumeX } from 'lucide-react';

const HeroCinema = ({ movie, onPlay, onMoreInfo }) => {
    const [isMuted, setIsMuted] = React.useState(true);

    if (!movie) return null;

    return (
        <div className="relative h-[95vh] w-full overflow-hidden bg-black">
            {/* Background Layer */}
            <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "linear" }}
                className="absolute inset-0"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${movie.cover_image || movie.cover}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/40 to-transparent" />
            </motion.div>

            {/* Content Layer */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 pb-24 z-10">
                <div className="max-w-4xl space-y-6">
                    {/* Metadata Badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap items-center gap-3"
                    >
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold tracking-widest uppercase rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                            Top 1 Trending
                        </span>
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium rounded-sm flex items-center gap-2">
                            <Monitor size={12} /> 4K Ultra HD
                        </span>
                        <span className="text-green-400 font-bold text-sm flex items-center gap-1">
                            <Star size={14} fill="currentColor" /> 9.9 Match
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-none tracking-tighter drop-shadow-2xl"
                    >
                        {movie.title}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="text-lg md:text-xl text-gray-200 max-w-2xl font-light leading-relaxed drop-shadow-md line-clamp-3"
                    >
                        {movie.description || "Một siêu phẩm tiên hiệp 2025. Hành trình tu tiên đầy gian nan, thử thách ý chí và lòng kiên định."}
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="flex items-center gap-4 pt-4"
                    >
                        <button
                            onClick={() => onPlay(movie)}
                            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                        >
                            <Play fill="currentColor" size={24} />
                            <span>Play Now</span>
                        </button>

                        <button
                            onClick={() => onMoreInfo(movie)}
                            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:bg-white/20 transition-colors"
                        >
                            <Info size={24} />
                            <span>More Info</span>
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Mute Toggle (Decorative for now) */}
            <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-24 right-16 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors hidden md:block"
            >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
        </div>
    );
};

export default HeroCinema;
