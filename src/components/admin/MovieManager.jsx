
import React, { useState, useEffect } from 'react';
import { movieService, adminService } from '../../lib/services';
import { Edit, Trash2, Plus, Video } from 'lucide-react';

const MovieManager = ({ onManageEpisodes }) => {
    const [movies, setMovies] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMovie, setCurrentMovie] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Tiên Hiệp',
        cover_image: '',
        video_url: ''
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMovies();
    }, []);

    const loadMovies = async () => {
        try {
            setLoading(true);
            console.log('Fetching movies...');
            const data = await movieService.getAllMovies();
            console.log('Movies fetched:', data);
            setMovies(data);
        } catch (error) {
            console.error('Error loading movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await adminService.updateMovie(currentMovie.id, formData);
            } else {
                await adminService.addMovie(formData);
            }
            loadMovies();
            resetForm();
        } catch (error) {
            console.error('Error saving movie:', error);
            alert('Failed to save movie');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this movie? All episodes will be deleted too.')) {
            try {
                await adminService.deleteMovie(id);
                loadMovies();
            } catch (error) {
                console.error('Error deleting movie:', error);
                alert('Failed to delete movie');
            }
        }
    };

    const startEdit = (movie) => {
        setIsEditing(true);
        setCurrentMovie(movie);
        setFormData({
            title: movie.title,
            description: movie.description,
            category: movie.category,
            cover_image: movie.cover_image || movie.cover,
            video_url: movie.video_url
        });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentMovie(null);
        setFormData({
            title: '',
            description: '',
            category: 'Tiên Hiệp',
            cover_image: '',
            video_url: ''
        });
    };

    return (
        <div className="space-y-6">
            {/* Form */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">{isEditing ? 'Edit Movie' : 'Add New Movie'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="bg-gray-700 text-white p-2 rounded border border-gray-600"
                            required
                        />
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="bg-gray-700 text-white p-2 rounded border border-gray-600"
                        >
                            <option value="Tiên Hiệp">Tiên Hiệp</option>
                            <option value="Huyền Huyễn">Huyền Huyễn</option>
                            <option value="Kiếm Hiệp">Kiếm Hiệp</option>
                            <option value="Xuyên Không">Xuyên Không</option>
                        </select>
                    </div>
                    <textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 h-24"
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Cover Image URL"
                            value={formData.cover_image}
                            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                            className="bg-gray-700 text-white p-2 rounded border border-gray-600"
                        />
                        <input
                            type="text"
                            placeholder="Trailer/Default Video URL"
                            value={formData.video_url}
                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                            className="bg-gray-700 text-white p-2 rounded border border-gray-600"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded flex items-center gap-2">
                            {isEditing ? <Edit size={16} /> : <Plus size={16} />}
                            {isEditing ? 'Cập nhật phim' : 'Thêm phim mới'}
                        </button>
                        {isEditing && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onManageEpisodes(currentMovie)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2"
                                >
                                    <Video size={16} />
                                    Quản lý tập phim
                                </button>
                                <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">
                                    Hủy
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Tên Phim</th>
                            <th className="p-4">Thể Loại</th>
                            <th className="p-4">Số Tập</th>
                            <th className="p-4">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {movies.map((movie) => (
                            <tr key={movie.id} className="hover:bg-gray-700/50">
                                <td className="p-4">{movie.id}</td>
                                <td className="p-4 font-medium text-white">{movie.title}</td>
                                <td className="p-4">{movie.category}</td>
                                <td className="p-4">{movie.episode_count}</td>
                                <td className="p-4 flex gap-2">
                                    <button
                                        onClick={() => onManageEpisodes(movie)}
                                        className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/40 flex items-center gap-1 text-sm"
                                        title="Manage Episodes"
                                    >
                                        <Video size={14} /> Tập phim
                                    </button>
                                    <button
                                        onClick={() => startEdit(movie)}
                                        className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/40 flex items-center gap-1 text-sm"
                                        title="Edit"
                                    >
                                        <Edit size={14} /> Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(movie.id)}
                                        className="px-3 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 flex items-center gap-1 text-sm"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} /> Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MovieManager;
