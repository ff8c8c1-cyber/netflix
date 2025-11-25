
import React, { useState, useEffect } from 'react';
import { Shield, Film, Users, Lock, LogOut } from 'lucide-react';
import MovieManager from '../components/admin/MovieManager';
import EpisodeManager from '../components/admin/EpisodeManager';
import UserManager from '../components/admin/UserManager';

import { API_BASE_URL } from '../config/api';

const AdminPage = () => {
    // Independent Admin State
    const [adminUser, setAdminUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // UI State
    const [activeTab, setActiveTab] = useState('movies');
    const [selectedMovieForEpisodes, setSelectedMovieForEpisodes] = useState(null);

    // Login Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check for existing admin session
        const storedAdmin = localStorage.getItem('admin_user');
        if (storedAdmin) {
            setAdminUser(JSON.parse(storedAdmin));
        }
        setLoadingAuth(false);
    }, []);


    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Call API directly to avoid using useGameStore
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.user.role !== 'admin') {
                throw new Error('Unauthorized: You do not have admin privileges.');
            }

            // Save to separate admin storage
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            setAdminUser(data.user);
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_user');
        setAdminUser(null);
        setUsername('');
        setPassword('');
    };

    if (loadingAuth) {
        return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading Admin Portal...</div>;
    }

    // 1. Not Logged In -> Show Login Form
    if (!adminUser) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield size={32} className="text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                        <p className="text-gray-400 mt-2">Please sign in to continue</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                                placeholder="Enter admin username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Lock size={18} />
                                    Access Dashboard
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // 2. Logged In (Admin check handled in login) -> Show Dashboard
    const handleManageEpisodes = (movie) => {
        setSelectedMovieForEpisodes(movie);
        setActiveTab('episodes');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600 rounded-lg">
                            <Shield size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-gray-400">Welcome back, {adminUser.username}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-lg"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        <button
                            onClick={() => { setActiveTab('movies'); setSelectedMovieForEpisodes(null); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'movies' && !selectedMovieForEpisodes ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                        >
                            <Film size={20} />
                            Movies
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                        >
                            <Users size={20} />
                            Users
                        </button>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'movies' && !selectedMovieForEpisodes && (
                            <MovieManager onManageEpisodes={handleManageEpisodes} />
                        )}

                        {activeTab === 'episodes' && selectedMovieForEpisodes && (
                            <EpisodeManager
                                movie={selectedMovieForEpisodes}
                                onBack={() => { setSelectedMovieForEpisodes(null); setActiveTab('movies'); }}
                            />
                        )}

                        {activeTab === 'users' && (
                            <UserManager />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
