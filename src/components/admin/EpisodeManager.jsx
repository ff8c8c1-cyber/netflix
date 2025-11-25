
import React, { useState, useEffect } from 'react';
import { movieService, adminService } from '../../lib/services';
import { Edit, Trash2, Plus, ArrowLeft, Upload } from 'lucide-react';

import { API_BASE_URL } from '../../config/api';

const EpisodeManager = ({ movie, onBack }) => {
    const [episodes, setEpisodes] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [formData, setFormData] = useState({
        episode_number: '',
        title: '',
        video_url: '',
        duration: 0
    });

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        loadEpisodes();
    }, [movie]);

    const loadEpisodes = async () => {
        if (movie) {
            try {
                setLoading(true);
                console.log(`Fetching episodes for movie ${movie.id}...`);
                const data = await movieService.getMovieEpisodes(movie.id);
                console.log('Episodes fetched:', data);
                setEpisodes(data);
                // Auto-increment episode number for new add
                setFormData(prev => ({
                    ...prev,
                    episode_number: data.length + 1,
                    title: `Tập ${data.length + 1}`
                }));
            } catch (error) {
                console.error('Error loading episodes:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                movie_id: movie.id,
                ...formData
            };

            if (isEditing) {
                await adminService.updateEpisode(currentEpisode.id, payload);
            } else {
                await adminService.addEpisode(payload);
            }
            loadEpisodes();
            resetForm();
        } catch (error) {
            console.error('Error saving episode:', error);
            alert('Failed to save episode');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this episode?')) {
            try {
                await adminService.deleteEpisode(id);
                loadEpisodes();
            } catch (error) {
                console.error('Error deleting episode:', error);
                alert('Failed to delete episode');
            }
        }
    };

    const startEdit = (ep) => {
        setIsEditing(true);
        setCurrentEpisode(ep);
        setFormData({
            episode_number: ep.episode_number,
            title: ep.title,
            video_url: ep.video_url,
            duration: ep.duration || 0
        });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentEpisode(null);
        setFormData({
            episode_number: episodes.length + 1,
            title: `Tập ${episodes.length + 1}`,
            video_url: '',
            duration: 0
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-gray-700 rounded-full text-white">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-white">
                    Episodes for: <span className="text-cyan-400">{movie.title}</span>
                </h2>
            </div>

            {/* Form */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">{isEditing ? 'Edit Episode' : 'Add New Episode'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="number"
                            placeholder="Ep #"
                            value={formData.episode_number}
                            onChange={(e) => setFormData({ ...formData, episode_number: e.target.value })}
                            className="bg-gray-700 text-white p-2 rounded border border-gray-600"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="bg-gray-700 text-white p-2 rounded border border-gray-600 col-span-3"
                            required
                        />
                    </div>

                    {/* Video URL Input */}
                    <input
                        type="text"
                        placeholder="Video URL (nhập link hoặc upload file bên dưới)"
                        value={formData.video_url}
                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                    />

                    {/* File Upload with Progress */}
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                        <label className="block text-sm text-gray-400 mb-2">Upload Video File (Max 5GB)</label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors">
                                <Upload size={18} />
                                <span>Chọn Video từ máy tính</span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        // Use XMLHttpRequest for progress tracking
                                        const xhr = new XMLHttpRequest();
                                        const formData = new FormData();
                                        formData.append('video', file);

                                        xhr.upload.onprogress = (event) => {
                                            if (event.lengthComputable) {
                                                const percentComplete = Math.round((event.loaded / event.total) * 100);
                                                setProgress(percentComplete);
                                            }
                                        };

                                        xhr.onload = () => {
                                            if (xhr.status === 200) {
                                                try {
                                                    const data = JSON.parse(xhr.responseText);
                                                    setFormData(prev => ({ ...prev, video_url: data.url }));
                                                    alert('Upload thành công!');
                                                } catch (err) {
                                                    console.error('JSON Parse Error:', err);
                                                    alert('Upload thành công nhưng lỗi phản hồi server.');
                                                }
                                            } else {
                                                alert('Upload thất bại: ' + xhr.statusText);
                                            }
                                            setProgress(0);
                                        };

                                        xhr.onerror = () => {
                                            alert('Upload thất bại do lỗi mạng.');
                                            setProgress(0);
                                        };

                                        xhr.open('POST', `${API_BASE_URL}/api/upload/video`);
                                        xhr.send(formData);
                                    }}
                                />
                            </label>
                            {progress > 0 && (
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Uploading...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-600 rounded-full h-2">
                                        <div
                                            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading || progress > 0}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {isEditing ? 'Update Episode' : 'Add Episode'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div >

            {/* List */}
            < div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden" >
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">Ep #</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Video URL</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {episodes.map((ep) => (
                            <tr key={ep.id} className="hover:bg-gray-700/50">
                                <td className="p-4 font-bold">{ep.episode_number}</td>
                                <td className="p-4">{ep.title}</td>
                                <td className="p-4 text-xs text-gray-500 truncate max-w-xs">{ep.video_url}</td>
                                <td className="p-4 flex gap-2">
                                    <button
                                        onClick={() => startEdit(ep)}
                                        className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40"
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ep.id)}
                                        className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div >
        </div >
    );
};

export default EpisodeManager;
