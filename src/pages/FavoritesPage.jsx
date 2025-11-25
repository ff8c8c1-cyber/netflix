import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Play, Star } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { API_BASE_URL } from '../config/api';

const FavoritesPage = () => {
    const { user } = useGameStore();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/favorites`);
            const data = await response.json();
            setFavorites(data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (e, movieId) => {
        e.preventDefault(); // Prevent navigation
        if (!confirm('Remove from favorites?')) return;

        try {
            await fetch(`${API_BASE_URL}/api/favorites/${user.id}/${movieId}`, {
                method: 'DELETE'
            });
            setFavorites(prev => prev.filter(m => m.id !== movieId));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#020617] pt-24 px-6 flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <Heart size={48} className="mx-auto mb-4 text-gray-600" />
                    <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
                    <p>Please login to view your favorites.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] pt-24 px-6 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-600/20 rounded-full">
                        <Heart size={32} className="text-red-500" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Favorites</h1>
                        <p className="text-gray-400">{favorites.length} movies saved</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading...</div>
                ) : favorites.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <Heart size={48} className="mx-auto mb-4 text-gray-700" />
                        <h3 className="text-xl font-bold text-white mb-2">No Favorites Yet</h3>
                        <p className="text-gray-400 mb-6">Start adding movies to your list!</p>
                        <Link to="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-colors">
                            Browse Movies
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {favorites.map((movie) => (
                            <Link to={`/watch/${movie.id}`} key={movie.id} className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/20">
                                {/* Image Container */}
                                <div className="aspect-[2/3] relative overflow-hidden">
                                    <img
                                        src={movie.cover_image}
                                        alt={movie.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50">
                                            <Play size={20} className="text-white ml-1" fill="currentColor" />
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => removeFavorite(e, movie.id)}
                                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                                        title="Remove from favorites"
                                    >
                                        <Heart size={16} fill="currentColor" />
                                    </button>

                                    {/* Rating Badge */}
                                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                                        <Star size={12} className="text-yellow-500" fill="currentColor" />
                                        <span className="text-xs font-bold text-white">{movie.rating || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-bold text-white truncate group-hover:text-red-500 transition-colors">{movie.title}</h3>
                                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                                        <span>{movie.category}</span>
                                        <span>{movie.views?.toLocaleString()} views</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
