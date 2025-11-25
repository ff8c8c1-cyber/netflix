import React, { useState, useEffect } from 'react';
import { TrendingUp, Star, Lightbulb, Zap, Sparkles, Crown, Trophy } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { movieService, watchHistoryService, userService } from '../lib/services';
import MovieCard from './MovieCard';

const Recommendations = () => {
    const { user, setSelectedMovie, setIsPlaying } = useGameStore();
    const [recommendations, setRecommendations] = useState({ trending: [], personalized: [], newReleases: [], topRated: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personalized');
    const [userStats, setUserStats] = useState(null);

    useEffect(() => {
        if (user) {
            userService.getUserHomeStats(user.id).then(stats => {
                setUserStats(stats);
            });
        }
    }, [user]);

    const nav = (nav) => {
        setSelectedMovie(nav);
        setIsPlaying(true);
        nav('/watch');
    };

    useEffect(() => {
        const loadRecommendations = async () => {
            setLoading(true);
            try {
                // Load different types of recommendations from DB
                const [trending, newReleases, topRated] = await Promise.all([
                    movieService.getTrendingMovies(),
                    movieService.getNewReleases(),
                    movieService.getTopRatedMovies()
                ]);

                // Get personalized recommendations based on user's history
                let personalized = [];
                if (user) {
                    try {
                        const history = await watchHistoryService.getRecentWatched(user.id, 5);
                        const watchHistoryGenres = history.map(item => item.category);

                        // Simple recommendation algorithm: suggest movies from similar categories
                        // For now, we reuse trending/new as pool, but ideally should be a specific SP
                        const allMovies = [...trending, ...newReleases, ...topRated];
                        // Deduplicate
                        const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());

                        const userGenres = [...new Set(watchHistoryGenres.filter(Boolean))];
                        if (userGenres.length > 0) {
                            personalized = uniqueMovies
                                .filter(movie =>
                                    userGenres.some(genre => movie.category === genre) &&
                                    !history.some(watched => watched.movie_id === movie.id)
                                )
                                .slice(0, 8);
                        }
                    } catch (error) {
                        console.error('Error loading personalized recommendations:', error);
                        personalized = trending.slice(0, 8);
                    }
                } else {
                    personalized = trending.slice(0, 8);
                }

                setRecommendations({
                    trending,
                    personalized: personalized.length > 0 ? personalized : trending.slice(0, 8),
                    newReleases,
                    topRated
                });

            } catch (error) {
                console.error('Error loading recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRecommendations();
    }, [user]);

    const tabs = [
        {
            id: 'personalized',
            label: 'Cho Bạn',
            icon: Lightbulb,
            desc: 'Dựa trên lịch sử xem của bạn',
            data: recommendations.personalized,
            badge: 'AI'
        },
        {
            id: 'trending',
            label: 'Thịnh Hành',
            icon: TrendingUp,
            desc: 'Đang hot trên nền tảng',
            data: recommendations.trending,
            badge: 'HOT'
        },
        {
            id: 'new',
            label: 'Mới Xuất Thế',
            icon: Zap,
            desc: 'Bí tịch mới cập nhật',
            data: recommendations.newReleases,
            badge: 'NEW'
        },
        {
            id: 'topRated',
            label: 'Đỉnh Cao',
            icon: Crown,
            desc: 'Đánh giá cao nhất',
            data: recommendations.topRated,
            badge: 'TOP'
        }
    ];

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="text-cyan-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">Khám Phá Bí Tịch</h2>
                </div>
                <div className="animate-pulse space-y-4">
                    <div className="flex gap-4 mb-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-8 w-24 bg-gray-700 rounded"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-48 bg-gray-700 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-cyan-400" size={24} />
                <h2 className="text-2xl font-bold text-white">Khám Phá Bí Tịch</h2>
                <span className="bg-cyan-600/20 text-cyan-400 px-2 py-1 rounded-full text-xs border border-cyan-500/30">
                    AI Recommendations
                </span>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            <Icon size={16} />
                            <span className="font-medium">{tab.label}</span>
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {tab.badge}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {tabs.map((tab) => {
                if (activeTab !== tab.id) return null;

                const Icon = tab.icon;

                return (
                    <div key={tab.id}>
                        <div className="flex items-center gap-3 mb-4">
                            <Icon className="text-cyan-400" size={20} />
                            <div>
                                <h3 className="text-xl font-bold text-white">{tab.label}</h3>
                                <p className="text-gray-400 text-sm">{tab.desc}</p>
                            </div>
                            <span className="bg-cyan-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                {tab.data.length} Bí Tịch
                            </span>
                        </div>

                        {tab.data.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {tab.data.map((movie) => (
                                    <MovieCard
                                        key={`rec-${tab.id}-${movie.id}`}
                                        movie={movie}
                                        onClick={nav}
                                        showMeta={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Icon size={48} className="text-gray-600 mx-auto mb-4" />
                                <h4 className="text-gray-400 text-lg font-medium mb-2">
                                    Không có đề xuất phù hợp
                                </h4>
                                <p className="text-gray-500 text-sm">
                                    Tiếp tục khám phá để nhận đề xuất tốt hơn!
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Quick Stats */}
            {user && userStats && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-400" />
                        Hoạt Động Cá Nhân
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <div className="text-cyan-400 text-sm">Phim Đã Xem</div>
                            <div className="text-white font-bold text-lg">{userStats.movies_watched}</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <div className="text-cyan-400 text-sm">Thể Loại Yêu Thích</div>
                            <div className="text-white font-bold text-lg">{userStats.favorite_category}</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <div className="text-cyan-400 text-sm">Thời Gian Tu Luyện</div>
                            <div className="text-white font-bold text-lg">{(userStats.total_watch_seconds / 3600).toFixed(1)}h</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <div className="text-cyan-400 text-sm">Rank Hiện Tại</div>
                            <div className="text-white font-bold text-lg">{user.rank_name || 'Phàm Nhân'}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Recommendations;
