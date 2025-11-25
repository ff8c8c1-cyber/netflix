import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Star, Eye, TrendingUp } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import MovieCard from '../components/MovieCard';
import SectionTitle from '../components/SectionTitle';
import { useGameStore } from '../store/useGameStore';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setSelectedMovie, setIsPlaying, searchMovies, movies } = useGameStore();

    const query = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(query);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState('relevance');
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    const handlePlayMovie = (movie) => {
        setSelectedMovie(movie);
        setIsPlaying(true);
        navigate('/watch');
    };

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            try {
                const results = await searchMovies(searchQuery, selectedCategory, minRating, sortBy);
                setFilteredMovies(results);
            } catch (error) {
                console.error('Error searching movies:', error);
                setFilteredMovies([]);
            } finally {
                setLoading(false);
            }
        };

        if (searchQuery || selectedCategory !== 'all' || minRating > 0) {
            performSearch();
        } else {
            setFilteredMovies(movies);
        }
    }, [searchQuery, selectedCategory, minRating, sortBy, searchMovies, movies]);

    const handleSearch = () => {
        const newParams = new URLSearchParams(searchParams);
        if (searchQuery.trim()) {
            newParams.set('q', searchQuery.trim());
        } else {
            newParams.delete('q');
        }
        setSearchParams(newParams);
    };

    useEffect(() => {
        setSearchQuery(query);
    }, [query]);

    return (
        <div className="min-h-screen pb-20">
            <div className="bg-gradient-to-b from-[#020617] to-[#0a0a0a] pt-8 pb-12">
                <div className="max-w-7xl mx-auto px-8">
                    {/* Search Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black text-white mb-4">
                            Tìm Kiếm <span className="text-cyan-400">Bí Tịch</span>
                        </h1>
                        <div className="max-w-2xl mx-auto">
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-6 py-4 focus-within:border-cyan-500/50 focus-within:bg-black/40 transition-all">
                                <Search size={20} className="text-cyan-400 mr-4" />
                                <input
                                    type="text"
                                    placeholder="Nhập tên bí tịch, đạo hữu, hoặc tông môn..."
                                    className="bg-transparent border-none outline-none text-lg w-full text-white placeholder-gray-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="ml-4 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-full font-bold transition-all"
                                >
                                    Tìm Kiếm
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <Filter size={20} className="text-cyan-400" />
                            <span className="text-white font-bold text-lg">Bộ Lọc</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">Loại Bí Kịch</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                                >
                                    <option value="all">Tất Cả Loại</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Min Rating */}
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">Đánh Giá Tối Thiểu</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={minRating}
                                        onChange={(e) => setMinRating(parseFloat(e.target.value))}
                                        className="flex-1 accent-cyan-500"
                                    />
                                    <span className="text-white text-sm w-8">{minRating.toFixed(1)}</span>
                                </div>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">Sắp Xếp Theo</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                                >
                                    <option value="relevance">Độ Phù Hợp</option>
                                    <option value="rating">Đánh Giá</option>
                                    <option value="views">Lượt Xem</option>
                                    <option value="title">Tên A-Z</option>
                                </select>
                            </div>

                            {/* View Mode */}
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">Chế Độ Xem</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                                    >
                                        <Grid size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                                    >
                                        <List size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                Kết Quả Tìm Kiếm{' '}
                                <span className="text-cyan-400">({filteredMovies.length})</span>
                            </h2>
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSearchParams(new URLSearchParams());
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Xóa Bộ Lọc
                                </button>
                            )}
                        </div>

                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredMovies.map((movie) => (
                                    <MovieCard
                                        key={movie.id}
                                        movie={movie}
                                        onClick={handlePlayMovie}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredMovies.map((movie) => (
                                    <div
                                        key={movie.id}
                                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer group"
                                        onClick={() => handlePlayMovie(movie)}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                <div className={`w-full h-full bg-gradient-to-r ${movie.cover}`}></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                                                    {movie.title}
                                                </h3>
                                                <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                                                    {movie.desc}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1 text-yellow-400">
                                                        <Star size={14} fill="currentColor" />
                                                        <span>{movie.rating}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-400">
                                                        <Eye size={14} />
                                                        <span>{movie.views}</span>
                                                    </div>
                                                    <div className="text-gray-400 capitalize">
                                                        {movie.category}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {filteredMovies.length === 0 && (
                            <div className="text-center py-16">
                                <Search size={64} className="text-gray-600 mx-auto mb-4" />
                                <h3 className="text-gray-400 text-xl font-bold mb-2">
                                    Không Tìm Thấy Bí Tịch
                                </h3>
                                <p className="text-gray-500">
                                    Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
