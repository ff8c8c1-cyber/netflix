import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Settings, ChevronDown, Sparkles, Bot, Star, ListPlus, MessageCircle, Heart, Share, RotateCcw, PlayCircle, Maximize2, Minimize2, SkipForward, X, Target, Bookmark, Video } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { callGemini } from '../lib/gemini';
import ReactPlayer from 'react-player';
import CommentsSection from '../components/CommentsSection';
import PlaylistManager from '../components/PlaylistManager';
import GamificationDashboard from '../components/GamificationDashboard';
import { movieService, reviewService, watchHistoryService, userService } from '../lib/services';

import { API_BASE_URL } from '../config/api';

const WatchPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        user,
        selectedMovie,
        setSelectedMovie,
        setIsPlaying,
        isPlaying,
        updateExp,
        addLog,
        movies,
        fetchMovies,
        updateWatchTime
    } = useGameStore();

    const playerRef = useRef(null);
    const [movieInsight, setMovieInsight] = useState(null);
    const [isInsightLoading, setIsInsightLoading] = useState(false);
    const [showPlaylistManager, setShowPlaylistManager] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [watchProgress, setWatchProgress] = useState(0);
    const [movieReviews, setMovieReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    // Resume Playback State
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [savedTimestamp, setSavedTimestamp] = useState(0);

    // New Features State
    const [isCinemaMode, setIsCinemaMode] = useState(false);
    const [autoPlayNext, setAutoPlayNext] = useState(true);
    const [showAutoNext, setShowAutoNext] = useState(false);
    const [autoNextTimer, setAutoNextTimer] = useState(5);
    const timerRef = useRef(null);

    // Load movie data and related information
    useEffect(() => {
        const loadMovieData = async () => {
            if (!id) {
                navigate('/');
                return;
            }

            let currentMovie = selectedMovie;

            // If no selected movie or ID mismatch, fetch fresh data
            if (!currentMovie || currentMovie?.id?.toString() !== id) {
                try {
                    currentMovie = await movieService.getMovieById(id);
                    setSelectedMovie(currentMovie);
                } catch (error) {
                    console.error('Error fetching movie:', error);
                    navigate('/');
                    return;
                }
            }

            if (currentMovie) {
                try {
                    setLoading(true);

                    // Load recommendations
                    const recs = await movieService.getRecommendations(id);
                    setRecommendations(recs);

                    // Load episodes using ID from params
                    const eps = await movieService.getMovieEpisodes(id);
                    console.log('🎬 Loaded episodes:', eps);
                    setEpisodes(eps);

                    // Restore last watched episode
                    const lastEpisodeId = localStorage.getItem(`lastEpisode_${id}`);
                    console.log('💾 Saved episode ID:', lastEpisodeId);

                    let episodeToPlay = null;

                    if (lastEpisodeId && lastEpisodeId !== "undefined" && eps.length > 0) {
                        episodeToPlay = eps.find(e => e.id.toString() === lastEpisodeId);
                        if (episodeToPlay) console.log('🎯 Found saved episode:', episodeToPlay);
                    }

                    if (!episodeToPlay && eps.length > 0) {
                        episodeToPlay = eps[0];
                        console.log('⚠️ Defaulting to first episode');
                    } else if (!episodeToPlay) {
                        // Fallback if no episodes found (Single Movie)
                        episodeToPlay = {
                            video_url: currentMovie.video_url || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            title: currentMovie.title
                        };
                    }

                    setCurrentEpisode(episodeToPlay);

                    // Load reviews
                    const reviews = await reviewService.getMovieReviews(id);
                    setMovieReviews(reviews);

                    // Update watch history if user is logged in
                    let savedProgress = 0;
                    let savedEpisodeId = null;

                    if (user && user.id) {
                        try {
                            const response = await watchHistoryService.getWatchProgress(user.id, currentMovie.id);
                            savedProgress = response.progressSeconds || response; // Handle both formats
                            savedEpisodeId = response.episodeId;
                        } catch (err) {
                            console.error("Failed to get watch history:", err);
                        }
                    }

                    // Fallback to LocalStorage if API returns 0 or fails
                    if (savedProgress <= 0) {
                        const localProgress = localStorage.getItem(`watchProgress_${currentMovie.id}`);
                        if (localProgress) {
                            savedProgress = parseFloat(localProgress);
                        }
                    }

                    // Determine episode to play: DB > LocalStorage > Default
                    if (savedEpisodeId && eps.length > 0) {
                        const dbEpisode = eps.find(e => e.id === savedEpisodeId);
                        if (dbEpisode) {
                            episodeToPlay = dbEpisode;
                            console.log('☁️ Synced episode from DB:', dbEpisode);
                        }
                    }

                    setCurrentEpisode(episodeToPlay);

                    console.log('⏱️ Final saved progress:', savedProgress);
                    if (savedProgress > 10) {
                        setSavedTimestamp(savedProgress);
                        setShowResumePrompt(true);
                    }

                    // Update view count for everyone
                    await movieService.updateMovieViews(id);

                    // Update local state to show new view count immediately
                    setSelectedMovie(prev => ({
                        ...prev,
                        views: (prev?.views || 0) + 1
                    }));

                    // Check if user has liked this movie
                    if (user) {
                        const userReview = await reviewService.getUserReview(user.id, id);
                        setIsLiked(userReview ? userReview.rating > 0 : false);
                    }

                } catch (error) {
                    console.error('Error loading movie data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadMovieData();
    }, [id, user?.id]);

    // Save current episode to localStorage when it changes
    useEffect(() => {
        if (currentEpisode && currentEpisode.id && selectedMovie) {
            console.log('💾 Saving episode:', currentEpisode.id);
            localStorage.setItem(`lastEpisode_${selectedMovie.id}`, currentEpisode.id);
        }
    }, [currentEpisode, selectedMovie]);

    // Auto Next Timer Effect
    useEffect(() => {
        if (showAutoNext && autoNextTimer > 0) {
            timerRef.current = setTimeout(() => {
                setAutoNextTimer(prev => prev - 1);
            }, 1000);
        } else if (showAutoNext && autoNextTimer === 0) {
            handleNextEpisode();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [showAutoNext, autoNextTimer]);

    // Check if user has liked this movie and favorited
    useEffect(() => {
        const checkUserInteractions = async () => {
            if (user && id) {
                try {
                    // Check Review/Like
                    const userReview = await reviewService.getUserReview(user.id, id);
                    setIsLiked(userReview ? userReview.rating > 0 : false);

                    // Check Favorite
                    const isFav = await userService.checkFavorite(user.id, id);
                    setIsFavorited(isFav);
                } catch (error) {
                    console.error('Error checking user interactions:', error);
                }
            }
        };
        checkUserInteractions();
    }, [user, id]);

    const toggleFavorite = async () => {
        if (!user) {
            alert('Please login to add to favorites');
            return;
        }

        try {
            if (isFavorited) {
                await userService.removeFromFavorites(user.id, id);
                setIsFavorited(false);
                addLog('Removed from favorites', 'info');
            } else {
                await userService.addToFavorites(user.id, id);
                setIsFavorited(true);
                addLog('Added to favorites', 'success');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            addLog('Failed to update favorites', 'error');
        }
    };

    // Track daily watch time & History
    useEffect(() => {
        let interval;
        if (isPlaying && !showResumePrompt && !showAutoNext && !loading) {
            interval = setInterval(() => {
                updateWatchTime(1);

                // Update history every 10 seconds or so to avoid spamming
                const currentTime = playerRef.current?.currentTime || 0;
                if (Math.floor(currentTime) % 10 === 0 && user) {
                    watchHistoryService.updateWatchProgress(user.id, id, Math.floor(currentTime), currentEpisode?.id);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, showResumePrompt, showAutoNext, loading, user, id, currentEpisode]);

    const handleResume = () => {
        setShowResumePrompt(false);
        if (playerRef.current) {
            // Check if it's ReactPlayer or native video
            if (playerRef.current.seekTo) {
                playerRef.current.seekTo(savedTimestamp, 'seconds');
            } else {
                playerRef.current.currentTime = savedTimestamp;
            }
            setIsPlaying(true);
            addLog(`Đã tiếp tục xem từ phút ${Math.floor(savedTimestamp / 60)}`, 'success');
        }
    };

    const handleStartOver = () => {
        setShowResumePrompt(false);
        if (playerRef.current) {
            if (playerRef.current.seekTo) {
                playerRef.current.seekTo(0);
            } else {
                playerRef.current.currentTime = 0;
            }
            setIsPlaying(true);
        }
        // Reset progress in DB and LocalStorage
        if (user && user.id) {
            watchHistoryService.updateWatchProgress(user.id, selectedMovie.id, 0, currentEpisode?.id);
        }
        localStorage.removeItem(`watchProgress_${selectedMovie.id}`);
    };

    const handleVideoEnded = () => {
        if (!autoPlayNext || episodes.length === 0) return;

        // Find current episode index
        const currentIndex = episodes.findIndex(e => e.id === currentEpisode?.id);
        if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
            setShowAutoNext(true);
            setAutoNextTimer(5);
        }
    };

    const handleNextEpisode = () => {
        const currentIndex = episodes.findIndex(e => e.id === currentEpisode?.id);
        if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
            const nextEpisode = episodes[currentIndex + 1];
            setCurrentEpisode(nextEpisode);
            setWatchProgress(0);
            setIsPlaying(true);
            setShowAutoNext(false);
            addLog(`Đang chuyển sang tập ${nextEpisode.episode_number}`, 'info');
        } else {
            setShowAutoNext(false);
        }
    };

    const cancelAutoNext = () => {
        setShowAutoNext(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const generateMovieInsight = async () => {
        setIsInsightLoading(true);
        const prompt = `Write a profound "Daoist Insight" (Ngộ Đạo) based on watching the xianxia movie "${selectedMovie.title}".
        The insight should sound philosophical, mysterious, and related to cultivation.
        Write in Vietnamese. Short paragraph.`;

        try {
            const insight = await callGemini(prompt);
            setMovieInsight(insight);
            updateExp(50);
            addLog('Ngộ đạo thành công! Nhận 50 EXP.', 'success');
        } catch (error) {
            console.error('Error generating insight:', error);
        } finally {
            setIsInsightLoading(false);
        }
    };

    const handleLikeMovie = async () => {
        if (!user) {
            addLog('Vui lòng đăng nhập để đánh giá!', 'warning');
            return;
        }

        try {
            const newRating = isLiked ? 0 : selectedMovie.rating;
            await reviewService.addReview(user.id, selectedMovie.id, newRating, 'Liked from watch page');
            setIsLiked(!isLiked);
            addLog(isLiked ? 'Đã bỏ like phim này' : 'Đã like phim này!', 'success');

            // Refresh reviews
            const reviews = await reviewService.getMovieReviews(selectedMovie.id);
            setMovieReviews(reviews);
        } catch (error) {
            console.error('Error liking movie:', error);
            addLog('Không thể cập nhật đánh giá', 'error');
        }
    };

    const lastSavedTime = useRef(0);

    const handleProgressChange = (progress) => {
        setWatchProgress(progress);

        const currentSeconds = Math.round(progress);

        // Save to LocalStorage (Instant backup)
        if (selectedMovie && selectedMovie.id) {
            localStorage.setItem(`watchProgress_${selectedMovie.id}`, currentSeconds);
        }

        // Save progress to database if user is logged in
        if (user && user.id) {
            // Save every 5 seconds to reduce API calls
            if (currentSeconds > lastSavedTime.current + 4) {
                // Pass currentEpisode.id if available
                const episodeId = currentEpisode?.id;
                watchHistoryService.updateWatchProgress(user.id, selectedMovie.id, currentSeconds, episodeId);
                lastSavedTime.current = currentSeconds;
            }
        }
    };

    const recommendedMovies = recommendations.length > 0 ? recommendations : movies
        .filter(movie => movie.id !== selectedMovie?.id && movie.category === selectedMovie?.category)
        .slice(0, 4);

    if (loading) {
        return (
            <div className="bg-black min-h-full flex flex-col">
                <div className="w-full aspect-video bg-[#050505] animate-pulse">
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                    </div>
                </div>
                <div className="p-8 space-y-4">
                    <div className="h-8 bg-gray-800 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                    <div className="h-32 bg-gray-800 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-black min-h-full flex flex-col ${isCinemaMode ? 'overflow-hidden h-screen' : ''}`}>
            {/* Player Container */}
            <div className={`relative group transition-all duration-500 ease-in-out ${isCinemaMode
                ? 'fixed inset-0 z-50 bg-black flex items-center justify-center w-screen h-screen'
                : 'w-full aspect-video bg-[#050505]'
                }`}>
                {/* Native Video Player for MP4 (More reliable) */}
                {(currentEpisode?.video_url || selectedMovie.video_url || "").endsWith('.mp4') ? (
                    <>
                        <video
                            ref={playerRef}
                            key={currentEpisode?.id || selectedMovie.id}
                            src={currentEpisode?.video_url || selectedMovie.video_url}
                            className={`object-contain ${isCinemaMode ? 'w-full h-full' : 'w-full h-full'}`}
                            controls
                            autoPlay={!showResumePrompt}
                            muted={showResumePrompt} // Mute if prompt is showing
                            playsInline
                            onPlay={() => {
                                setIsPlaying(true);
                                if (user) updateExp(5);
                            }}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={(e) => handleProgressChange(e.target.currentTime)}
                            onEnded={handleVideoEnded}
                            onError={(e) => {
                                console.error("Native Video Error:", e);
                                console.log("Video Source:", currentEpisode?.video_url || selectedMovie.video_url);
                            }}
                        >
                            Your browser does not support the video tag.
                        </video>
                        <div className="absolute top-0 left-0 bg-black/50 text-white text-xs p-2 z-50">
                            Debug: <a href={currentEpisode?.video_url || selectedMovie.video_url} target="_blank" rel="noreferrer" className="underline text-cyan-400">Open Video Directly</a>
                        </div>
                    </>
                ) : (
                    <ReactPlayer
                        ref={playerRef}
                        key={currentEpisode?.id || selectedMovie.id}
                        url={currentEpisode?.video_url || selectedMovie.video_url || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
                        width="100%"
                        height="100%"
                        onProgress={({ playedSeconds }) => handleProgressChange(playedSeconds)}
                        onEnded={handleVideoEnded}
                        controls={true}
                        onPlay={() => {
                            setIsPlaying(true);
                            if (user) updateExp(5);
                        }}
                        onPause={() => setIsPlaying(false)}
                        onError={(e) => console.error("Video Error:", e)}
                        playing={!showResumePrompt && !showAutoNext}
                        muted={showResumePrompt}
                    />
                )}

                {/* Auto Next Overlay */}
                {showAutoNext && (
                    <div className="absolute inset-0 z-40 flex items-end justify-end pb-16 pr-8 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none">
                        <div className="bg-gray-900/90 border border-cyan-500/50 rounded-xl p-4 shadow-[0_0_30px_rgba(8,145,178,0.3)] pointer-events-auto animate-in slide-in-from-right duration-500">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="24" cy="24" r="20"
                                            className="stroke-gray-700"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <circle
                                            cx="24" cy="24" r="20"
                                            className="stroke-cyan-400 transition-all duration-1000 ease-linear"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray="126"
                                            strokeDashoffset={126 - (126 * autoNextTimer) / 5}
                                        />
                                    </svg>
                                    <span className="absolute text-lg font-bold text-white">{autoNextTimer}</span>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Tự động chuyển</p>
                                    <p className="text-cyan-400 font-bold">Cảnh giới tiếp theo</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={cancelAutoNext}
                                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleNextEpisode}
                                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                    <SkipForward size={14} />
                                    Chuyển ngay
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resume Prompt Modal */}
                {showResumePrompt && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-gray-900 border border-cyan-500/50 rounded-xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(8,145,178,0.3)] text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-cyan-500/20 rounded-full">
                                    <RotateCcw className="text-cyan-400 w-8 h-8" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Tiếp tục tu luyện?</h3>
                            <p className="text-gray-400 mb-6">
                                Đạo hữu đã xem đến phút <span className="text-cyan-400 font-mono font-bold">{Math.floor(savedTimestamp / 60)}:{String(Math.floor(savedTimestamp % 60)).padStart(2, '0')}</span>.
                                Có muốn tiếp tục không?
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleStartOver}
                                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors flex items-center gap-2"
                                >
                                    <RotateCcw size={16} />
                                    Xem lại từ đầu
                                </button>
                                <button
                                    onClick={handleResume}
                                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                                >
                                    <PlayCircle size={16} />
                                    Tiếp tục xem
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Back Button (Only show if NOT in Cinema Mode) */}
                {!isCinemaMode && (
                    <button
                        onClick={() => { setIsPlaying(false); navigate('/'); }}
                        className="absolute top-6 left-6 bg-black/50 hover:bg-black/80 backdrop-blur text-white p-3 rounded-full transition-colors z-20 hover-lift"
                    >
                        <ChevronDown className="rotate-90" size={20} />
                    </button>
                )}

                {/* Cinema Mode Toggle & Stats */}
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-20">
                    {/* Cinema Toggle */}
                    <button
                        onClick={() => setIsCinemaMode(!isCinemaMode)}
                        className="bg-black/60 backdrop-blur border border-cyan-500/30 hover:bg-cyan-900/40 text-white p-3 rounded-xl transition-all hover-lift group"
                        title={isCinemaMode ? "Thoát Bế Quan" : "Bế Quan Tu Luyện"}
                    >
                        {isCinemaMode ? (
                            <Minimize2 size={20} className="text-cyan-400" />
                        ) : (
                            <Maximize2 size={20} className="text-gray-300 group-hover:text-cyan-400" />
                        )}
                    </button>

                    {/* Stats (Hidden in Cinema Mode unless hovered maybe? For now keep it) */}
                    {!isCinemaMode && (
                        <div className="bg-black/60 backdrop-blur border border-cyan-500/30 rounded-xl p-4 animate-in slide-in-from-right duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-400 text-xs font-bold uppercase">Hiệu suất tu luyện</span>
                            </div>
                            <div className="text-white font-mono text-sm">
                                EXP: <span className="text-cyan-400">+{5}/min</span>
                                {user && (
                                    <div className="text-purple-300 text-xs mt-1">
                                        Progress: {Math.round((watchProgress / (selectedMovie.duration || 5400)) * 100)}%
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Movie Info & Actions (Hidden in Cinema Mode) */}
            {!isCinemaMode && (
                <div className="p-6 md:p-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="col-span-1 lg:col-span-2">
                            {/* Title & Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                        {selectedMovie.title}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Star size={16} fill="currentColor" className="text-yellow-500" />
                                            <span>{selectedMovie.rating}</span>
                                        </div>
                                        <span>•</span>
                                        <span>{selectedMovie.views?.toLocaleString() || 0} lượt xem</span>
                                        <span>•</span>
                                        <span>{selectedMovie.category}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleLikeMovie}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isLiked
                                            ? 'bg-red-600 hover:bg-red-500 text-white'
                                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                            }`}
                                    >
                                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                                        {isLiked ? 'Đã thích' : 'Thích'}
                                    </button>

                                    <button
                                        onClick={toggleFavorite}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isFavorited
                                            ? 'bg-pink-600 hover:bg-pink-500 text-white'
                                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                            }`}
                                    >
                                        <Bookmark size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                                        {isFavorited ? 'Đã lưu' : 'Lưu'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            const roomId = Math.random().toString(36).substring(7);
                                            navigate(`/watch-party/${roomId}?movieId=${id}`);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-all"
                                    >
                                        <Video size={18} />
                                        Xem Chung
                                    </button>

                                    {user && (
                                        <>
                                            <button
                                                onClick={() => setShowDashboard(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-orange-500/20"
                                            >
                                                <Target size={18} />
                                                Nhiệm Vụ
                                            </button>
                                            <button
                                                onClick={() => setShowPlaylistManager(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-all"
                                            >
                                                <ListPlus size={18} />
                                                Playlist
                                            </button>
                                        </>
                                    )}

                                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-all">
                                        <Share size={18} />
                                        Chia sẻ
                                    </button>

                                    {/* AI Insight Button */}
                                    <button
                                        onClick={generateMovieInsight}
                                        disabled={isInsightLoading}
                                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all disabled:opacity-50"
                                    >
                                        <Sparkles size={16} />
                                        {isInsightLoading ? "Đang ngộ đạo..." : "Ngộ Đạo (AI)"}
                                    </button>
                                </div>
                            </div>

                            {/* AI Insight Display */}
                            {movieInsight && (
                                <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-purple-400 font-bold flex items-center gap-2 mb-2">
                                        <Bot size={16} />
                                        Tâm Đắc Tu Luyện
                                    </h4>
                                    <p className="text-gray-300 italic leading-relaxed">
                                        "{movieInsight}"
                                    </p>
                                </div>
                            )}

                            {/* Movie Description */}
                            <div className="mb-8">
                                <p className="text-gray-400 leading-relaxed text-lg">
                                    {selectedMovie.description}
                                </p>
                            </div>

                            {/* Episode Selector */}
                            {episodes.length > 0 && (
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Play className="text-cyan-400" />
                                            Tập Phim ({episodes.length} tập)
                                        </h3>

                                        {/* Auto Next Toggle */}
                                        <button
                                            onClick={() => setAutoPlayNext(!autoPlayNext)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${autoPlayNext
                                                ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50'
                                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                                                }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${autoPlayNext ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'}`}></div>
                                            Tự động chuyển tập
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2">
                                        {episodes.map((ep) => (
                                            <button
                                                key={ep.id}
                                                onClick={() => {
                                                    setCurrentEpisode(ep);
                                                    setWatchProgress(0);
                                                    setIsPlaying(true);
                                                }}
                                                className={`aspect-square rounded-lg border-2 font-bold transition-all hover-lift ${currentEpisode?.id === ep.id
                                                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.5)]'
                                                    : 'bg-gray-800 text-gray-400 border-gray-600 hover:border-cyan-500'
                                                    }`}
                                            >
                                                {ep.episode_number}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews Stats */}
                            {movieReviews.length > 0 && (
                                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                                    <h4 className="text-white font-bold mb-2">Đánh giá từ cộng đồng</h4>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Star size={14} fill="currentColor" className="text-yellow-400" />
                                            <span className="text-white font-medium">{selectedMovie.rating}</span>
                                            <span className="text-gray-400">({movieReviews.length} đánh giá)</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Comments Section */}
                            {selectedMovie?.id && <CommentsSection movieId={selectedMovie.id} />}
                        </div>

                        {/* Sidebar - Recommended Movies */}
                        <div className="col-span-1">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Sparkles className="text-cyan-400" />
                                Bí Tịch Liên Quan
                            </h3>

                            <div className="space-y-3">
                                {recommendedMovies.length > 0 ? recommendedMovies.map((movie) => (
                                    <div
                                        key={movie.id}
                                        onClick={() => setSelectedMovie(movie)}
                                        className="group cursor-pointer bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all hover-lift"
                                    >
                                        <img
                                            src={movie.cover_image || movie.cover}
                                            alt={movie.title}
                                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="p-3">
                                            <h4 className="text-white font-medium text-sm mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                                                {movie.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Star size={10} fill="currentColor" className="text-yellow-500" />
                                                    {movie.rating}
                                                </span>
                                                <span>•</span>
                                                <span>{movie.views?.toLocaleString() || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Không có gợi ý</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Playlist Manager Modal */}
            {showPlaylistManager && (
                <PlaylistManager
                    movieId={selectedMovie.id}
                    onClose={() => setShowPlaylistManager(false)}
                />
            )}

            {/* Gamification Dashboard Modal */}
            {showDashboard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-2xl border border-gray-700">
                        <button
                            onClick={() => setShowDashboard(false)}
                            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                        <GamificationDashboard />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WatchPage;
