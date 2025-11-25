import React, { useState, useEffect } from 'react';
import { Plus, Play, Lock, Unlock, Search, X, ListPlus, Check } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { movieService } from '../lib/services';
import { supabase } from '../lib/supabase';

const PlaylistManager = ({ movieId, onClose }) => {
    const { user, addLog } = useGameStore();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    // Load user's playlists
    const loadPlaylists = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('playlists')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPlaylists(data || []);
        } catch (error) {
            console.error('Error loading playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlaylists();
    }, [user]);

    // Subscribe to playlist changes
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('user_playlists')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'playlists',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    loadPlaylists();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Create new playlist
    const handleCreatePlaylist = async () => {
        if (!user || !newPlaylistName.trim()) return;

        setCreating(true);
        try {
            const { data, error } = await supabase
                .from('playlists')
                .insert({
                    user_id: user.id,
                    name: newPlaylistName.trim(),
                    description: newPlaylistDesc.trim() || null,
                    is_public: isPublic
                })
                .select()
                .single();

            if (error) throw error;

            setPlaylists([data, ...playlists]);
            setNewPlaylistName('');
            setNewPlaylistDesc('');
            setIsPublic(false);
            addLog(`Đã tạo playlist "${data.name}"`, 'success');
        } catch (error) {
            console.error('Error creating playlist:', error);
        } finally {
            setCreating(false);
        }
    };

    // Add movie to playlist
    const handleAddToPlaylist = async (playlistId) => {
        try {
            const { error } = await supabase
                .from('playlist_items')
                .insert({
                    playlist_id: playlistId,
                    movie_id: movieId,
                    order_index: 0 // Temporary, could be improved
                });

            if (error && error.code !== '23505') { // 23505 = duplicate key
                throw error;
            }

            if (error?.code === '23505') {
                addLog('Bí tịch đã tồn tại trong playlist này', 'warning');
            } else {
                addLog('Đã thêm bí tịch vào playlist', 'success');
                onClose?.();
            }
        } catch (error) {
            console.error('Error adding to playlist:', error);
            addLog('Không thể thêm vào playlist', 'error');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-700 rounded"></div>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ListPlus className="text-cyan-400" size={24} />
                        Thêm vào Playlist
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Create New Playlist */}
                <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Tạo Playlist Mới</h4>
                    <input
                        type="text"
                        placeholder="Tên playlist..."
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white mb-3 focus:border-cyan-500 outline-none"
                    />
                    <textarea
                        placeholder="Mô tả (tùy chọn)..."
                        value={newPlaylistDesc}
                        onChange={(e) => setNewPlaylistDesc(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white mb-3 focus:border-cyan-500 outline-none resize-none"
                        rows={2}
                    />
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-gray-300 text-sm">
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="rounded"
                            />
                            {isPublic ? <Unlock size={14} /> : <Lock size={14} />}
                            Công khai
                        </label>
                        <button
                            onClick={handleCreatePlaylist}
                            disabled={creating || !newPlaylistName.trim()}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {creating ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Plus size={16} />
                            )}
                            Tạo
                        </button>
                    </div>
                </div>

                {/* Existing Playlists */}
                <div>
                    <h4 className="text-white font-medium mb-3">
                        Chọn Playlist ({playlists.length})
                    </h4>

                    {playlists.length === 0 ? (
                        <div className="text-center py-8">
                            <ListPlus size={48} className="text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">Chưa có playlist nào</p>
                            <p className="text-gray-500 text-sm">Tạo playlist đầu tiên của bạn!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {playlists.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    onClick={() => handleAddToPlaylist(playlist.id)}
                                    className="w-full p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-left transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h5 className="text-white font-medium flex items-center gap-2">
                                                <Play size={16} className="text-cyan-400" />
                                                {playlist.name}
                                                {playlist.is_public ? (
                                                    <Unlock size={12} className="text-green-400" title="Công khai" />
                                                ) : (
                                                    <Lock size={12} className="text-gray-400" title="Riêng tư" />
                                                )}
                                            </h5>
                                            {playlist.description && (
                                                <p className="text-gray-400 text-sm truncate">
                                                    {playlist.description}
                                                </p>
                                            )}
                                            <p className="text-gray-500 text-xs">
                                                Tạo: {new Date(playlist.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus size={16} className="text-cyan-400" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {onClose && (
                    <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaylistManager;
