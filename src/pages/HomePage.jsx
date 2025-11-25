import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { movieService, watchHistoryService } from '../lib/services';
import HeroCinema from '../components/HeroCinema';
import BentoGrid from '../components/BentoGrid';
import InfinitySlider from '../components/InfinitySlider';
import Recommendations from '../components/Recommendations';

const HomePage = () => {
    const navigate = useNavigate();
    const { user, setSelectedMovie, setIsPlaying, fetchMovies, movies } = useGameStore();
    const [featuredMovie, setFeaturedMovie] = useState(null);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [_, trending, newMovies, top] = await Promise.all([
                    fetchMovies(),
                    movieService.getTrendingMovies(),
                    movieService.getNewReleases(),
                    movieService.getTopRatedMovies()
                ]);

                setTrendingMovies(trending);
                setNewReleases(newMovies);
                setTopRated(top);

                // Set featured movie (Top 1 Trending)
                if (trending && trending.length > 0) {
                    setFeaturedMovie(trending[0]);
                } else if (movies.length > 0) {
                    setFeaturedMovie(movies[0]);
                }

            } catch (error) {
                console.error('Failed to load home data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [fetchMovies]);

    const handlePlayMovie = (movie) => {
        setSelectedMovie(movie);
        setIsPlaying(true);
        navigate(`/watch/${movie.id}`);
    };

    const handleMoreInfo = (movie) => {
        handlePlayMovie(movie); // For now, just play
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-cyan-500 selection:text-black">

            {/* 1. Hero Cinema - Immersive Entry */}
            <HeroCinema
                movie={featuredMovie}
                onPlay={handlePlayMovie}
                onMoreInfo={handleMoreInfo}
            />

            <div className="relative z-10 -mt-20 bg-gradient-to-b from-transparent via-[#020617] to-[#020617]">

                {/* 2. Infinity Slider - New Releases */}
                <div className="mb-8">
                    <InfinitySlider
                        title="New Arrivals"
                        movies={newReleases}
                        onPlay={handlePlayMovie}
                    />
                </div>

                {/* 3. Bento Grid - Trending & Discovery */}
                <BentoGrid
                    title="Trending Now"
                    movies={trendingMovies}
                    onPlay={handlePlayMovie}
                />

                {/* 4. Top Rated Collection */}
                <BentoGrid
                    title="Critically Acclaimed"
                    movies={topRated}
                    onPlay={handlePlayMovie}
                />

                {/* 5. Personalized Recommendations */}
                <div className="px-4 md:px-16 py-12">
                    <Recommendations />
                </div>


            </div>
        </div>
    );
};

export default HomePage;
