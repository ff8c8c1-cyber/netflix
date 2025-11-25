import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Play, Clock, Trash2 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { API_BASE_URL } from '../config/api';

const HistoryPage = () => {
    const { user } = useGameStore();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchHistory();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/history`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setHistory(data);
            } else {
                console.error('History data is not an array:', data);
                setHistory([]);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m ${s}s`;
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#020617] pt-24 px-6 flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <History size={48} className="mx-auto mb-4 text-gray-600" />
                    <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
                    <p>Please login to view your watch history.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] pt-24 px-6 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-cyan-600/20 rounded-full">
                        <History size={32} className="text-cyan-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Watch History</h1>
                        <p className="text-gray-400">Continue where you left off</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <Clock size={48} className="mx-auto mb-4 text-gray-700" />
                        <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
                        <p className="text-gray-400 mb-6">Start watching movies to build your history!</p>
                        <Link to="/" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-full transition-colors">
                            Browse Movies
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((item) => (
                            <Link to={`/watch/${item.id}`} key={item.id} className="group flex items-center gap-4 bg-gray-900/50 hover:bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-all">
                                {/* Thumbnail */}
                                <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.cover_image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                        <div
                                            className="h-full bg-cyan-500"
                                            style={{ width: `${Math.min(100, (item.progress_seconds / (item.duration || 3600)) * 100)}%` }} // Approximate duration if missing
                                        />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                        {item.episode_title && (
                                            <span className="bg-gray-800 px-2 py-1 rounded text-xs text-white border border-gray-700">
                                                {item.episode_title}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            Watched {new Date(item.last_watched_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="px-4">
                                    <span className="text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Resume
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
