import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { MessageCircle, Send, Users, Play, Pause, Copy, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { movieService } from '../lib/services';

import { API_BASE_URL } from '../config/api';

const WatchPartyPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useGameStore();
    const queryParams = new URLSearchParams(window.location.search);
    const movieId = queryParams.get('movieId');
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTitle, setCurrentTitle] = useState('Đang tải...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const playerRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Initialize Socket
    useEffect(() => {
        if (!user) return;

        const newSocket = io(API_BASE_URL);
        setSocket(newSocket);

        newSocket.emit('join_room', { roomId, username: user.username });

        newSocket.on('receive_message', (data) => {
            setMessages(prev => [...prev, data]);
        });

        newSocket.on('user_joined', (data) => {
            setMessages(prev => [...prev, { ...data, system: true }]);
        });

        newSocket.on('user_left', (data) => {
            setMessages(prev => [...prev, { ...data, system: true }]);
        });

        newSocket.on('receive_sync', (data) => {
            const { action, payload } = data;
            console.log('Sync Action:', action, payload);

            if (action === 'play') {
                setIsPlaying(true);
                playerRef.current?.play();
            }
            if (action === 'pause') {
                setIsPlaying(false);
                playerRef.current?.pause();
            }
            if (action === 'seek') {
                if (playerRef.current) {
                    playerRef.current.currentTime = payload.timestamp;
                }
            }
            if (action === 'url_change') {
                setVideoUrl(payload.url);
                setCurrentTitle('Đang phát video từ máy chủ...');
                setError(null);
            }
        });

        newSocket.on('current_room_state', (state) => {
            console.log('📥 Received Room State:', state);
            if (state.videoUrl) {
                setVideoUrl(state.videoUrl);
                setCurrentTitle('Đồng bộ từ phòng...');
                setError(null);
            }
            if (state.isPlaying !== undefined) {
                setIsPlaying(state.isPlaying);
                if (state.isPlaying) playerRef.current?.play();
                else playerRef.current?.pause();
            }
            if (state.timestamp) {
                if (playerRef.current) {
                    playerRef.current.currentTime = state.timestamp;
                }
            }
        });

        return () => newSocket.close();
    }, [roomId, user]);

    // Load movie and episodes if movieId is present
    useEffect(() => {
        const loadMovie = async () => {
            if (movieId && socket) { // Only load if socket is ready
                setLoading(true);
                setError(null);
                try {
                    const [movie, episodes] = await Promise.all([
                        movieService.getMovieById(movieId),
                        movieService.getMovieEpisodes(movieId)
                    ]);

                    let urlToPlay = '';
                    let titleToDisplay = '';

                    if (episodes && episodes.length > 0) {
                        urlToPlay = episodes[0].video_url;
                        titleToDisplay = `${movie.title} - ${episodes[0].title}`;
                    } else if (movie && movie.video_url) {
                        urlToPlay = movie.video_url;
                        titleToDisplay = movie.title;
                    }

                    if (urlToPlay) {
                        console.log('🎬 Host loaded video:', urlToPlay);
                        setVideoUrl(urlToPlay);
                        setCurrentTitle(titleToDisplay);

                        // Force sync to room immediately
                        socket.emit('sync_video', {
                            roomId,
                            action: 'url_change',
                            payload: { url: urlToPlay }
                        });
                    } else {
                        setCurrentTitle('Không tìm thấy video');
                        setError('Phim này chưa có link video.');
                    }
                } catch (error) {
                    console.error('Error loading movie:', error);
                    setCurrentTitle('Lỗi tải phim');
                    setError('Không thể tải thông tin phim.');
                } finally {
                    setLoading(false);
                }
            } else if (!movieId) {
                setLoading(false);
            }
        };
        loadMovie();
    }, [movieId, socket]);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !socket) return;

        const msgData = {
            roomId,
            username: user.username,
            message: inputMessage,
            timestamp: new Date().toISOString()
        };

        socket.emit('send_message', msgData);
        setInputMessage('');
    };

    const handlePlay = () => {
        if (!socket) return;
        setIsPlaying(true);
        socket.emit('sync_video', { roomId, action: 'play' });
    };

    const handlePause = () => {
        if (!socket) return;
        setIsPlaying(false);
        socket.emit('sync_video', { roomId, action: 'pause' });
    };

    const handleSeek = (e) => {
        if (!socket) return;
        socket.emit('sync_video', {
            roomId,
            action: 'seek',
            payload: { timestamp: e.target.currentTime }
        });
    };

    const handleSync = () => {
        if (!socket || !videoUrl) return;
        socket.emit('sync_video', {
            roomId,
            action: 'url_change',
            payload: { url: videoUrl }
        });
        if (playerRef.current) {
            socket.emit('sync_video', {
                roomId,
                action: 'seek',
                payload: { timestamp: playerRef.current.currentTime }
            });
        }
        alert('Đã đồng bộ lại với phòng!');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
                Please login to join a Watch Party.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] pt-20 px-4 pb-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Video Player Area */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-black rounded-xl overflow-hidden aspect-video relative shadow-2xl shadow-cyan-900/20 border border-gray-800 flex items-center justify-center">
                        {loading ? (
                            <div className="text-cyan-400 animate-pulse">Đang tải video...</div>
                        ) : error ? (
                            <div className="text-red-400 flex flex-col items-center gap-2">
                                <AlertTriangle size={32} />
                                <p>{error}</p>
                            </div>
                        ) : videoUrl ? (
                            <video
                                ref={playerRef}
                                src={videoUrl}
                                className="w-full h-full object-contain"
                                controls
                                onPlay={handlePlay}
                                onPause={handlePause}
                                onSeeked={handleSeek}
                            />
                        ) : (
                            <div className="text-gray-500">Chờ chủ phòng chọn phim...</div>
                        )}
                    </div>

                    <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                        <div>
                            <h2 className="text-xl font-bold text-white">Phòng: {roomId}</h2>
                            <p className="text-cyan-400 text-sm font-medium">{currentTitle}</p>
                            <p className="text-gray-500 text-xs mt-1 truncate max-w-md">{videoUrl}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSync}
                                className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 rounded-lg transition-colors"
                                title="Force Sync"
                            >
                                <RefreshCw size={20} />
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Đã sao chép link phòng!');
                                }}
                                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                                title="Copy Link"
                            >
                                <Copy size={20} />
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                                title="Leave Room"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="bg-gray-900/80 backdrop-blur rounded-xl border border-gray-800 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-800 flex items-center gap-2">
                        <MessageCircle className="text-cyan-500" size={20} />
                        <h3 className="font-bold text-white">Trò chuyện</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.username === user.username ? 'items-end' : 'items-start'}`}>
                                {msg.system ? (
                                    <span className="text-xs text-gray-500 w-full text-center my-2">{msg.message}</span>
                                ) : (
                                    <>
                                        <span className="text-xs text-gray-400 mb-1">{msg.username}</span>
                                        <div className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${msg.username === user.username
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-gray-800 text-gray-200'
                                            }`}>
                                            {msg.message}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 flex gap-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                        <button
                            type="submit"
                            className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WatchPartyPage;
