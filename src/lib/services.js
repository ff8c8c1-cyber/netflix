import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api`;

// User/Profile Services
export const userService = {
    async getCurrentUser() {
        // For now, we'll assume the user is stored in localStorage after login
        const user = JSON.parse(localStorage.getItem('user'));
        return user;
    },

    async getProfile(userId) {
        const response = await fetch(`${API_URL}/users/${userId}`);
        if (!response.ok) return null;
        return await response.json();
    },

    async updateProfile(userId, updates) {
        // TODO: Implement update API
        console.log('Update profile not implemented yet');
        return updates;
    },

    async getUserStats(userId) {
        const response = await fetch(`${API_URL}/users/${userId}`);
        if (!response.ok) return null;
        return await response.json();
    },

    async getUserHomeStats(userId) {
        const response = await fetch(`${API_URL}/users/${userId}/home-stats`);
        if (!response.ok) return null;
        return await response.json();
    },

    async getFavorites(userId) {
        const response = await fetch(`${API_URL}/users/${userId}/favorites`);
        if (!response.ok) return [];
        return await response.json();
    },

    async addToFavorites(userId, movieId) {
        const response = await fetch(`${API_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, movieId })
        });
        if (!response.ok) throw new Error('Failed to add to favorites');
        return await response.json();
    },

    async removeFromFavorites(userId, movieId) {
        const response = await fetch(`${API_URL}/favorites/${userId}/${movieId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to remove from favorites');
        return await response.json();
    },

    async checkFavorite(userId, movieId) {
        const response = await fetch(`${API_URL}/users/${userId}/favorites/${movieId}`);
        if (!response.ok) return false;
        const data = await response.json();
        return data.is_favorite;
    }
};

// Movie Services
export const movieService = {
    async getAllMovies() {
        const response = await fetch(`${API_URL}/movies`);
        if (!response.ok) throw new Error('Failed to fetch movies');
        return await response.json();
    },

    async getMovieById(id) {
        const response = await fetch(`${API_URL}/movies/${id}`);
        if (!response.ok) throw new Error('Failed to fetch movie details');
        return await response.json();
    },

    async getRecommendations(id) {
        const response = await fetch(`${API_URL}/movies/${id}/recommendations`);
        if (!response.ok) return [];
        return await response.json();
    },

    async getMoviesByCategory(category) {
        const movies = await this.getAllMovies();
        if (category && category !== 'all') {
            return movies.filter(m => m.category === category);
        }
        return movies;
    },

    async searchMovies(query, category = 'all', minRating = 0, sortBy = 'relevance') {
        let movies = await this.getAllMovies();

        // Text search
        if (query.trim()) {
            const lowerQuery = query.toLowerCase();
            movies = movies.filter(m =>
                m.title.toLowerCase().includes(lowerQuery) ||
                (m.description && m.description.toLowerCase().includes(lowerQuery))
            );
        }

        // Category filter
        if (category !== 'all') {
            movies = movies.filter(m => m.category === category);
        }

        // Rating filter
        if (minRating > 0) {
            movies = movies.filter(m => m.rating >= minRating);
        }

        // Sorting
        movies.sort((a, b) => b.rating - a.rating);

        return movies;
    },

    async getFeaturedMovies(limit = 5) {
        const movies = await this.getAllMovies();
        return movies.slice(0, limit);
    },

    async getMovieEpisodes(id) {
        const response = await fetch(`${API_URL}/movies/${id}/episodes`);
        if (!response.ok) return [];
        return await response.json();
    },

    async updateMovieViews(movieId) {
        await fetch(`${API_URL}/movies/${movieId}/views`, { method: 'POST' });
    },

    async getTrendingMovies() {
        const response = await fetch(`${API_URL}/movies/trending`);
        if (!response.ok) return [];
        return await response.json();
    },

    async getNewReleases() {
        const response = await fetch(`${API_URL}/movies/new`);
        if (!response.ok) return [];
        return await response.json();
    },

    async getTopRatedMovies() {
        const response = await fetch(`${API_URL}/movies/top-rated`);
        if (!response.ok) return [];
        return await response.json();
    },

    async getCategories() {
        const response = await fetch(`${API_URL}/movies/categories`);
        if (!response.ok) return [];
        return await response.json();
    }
};

// Review Services
export const reviewService = {
    async getMovieReviews(movieId) {
        const response = await fetch(`${API_URL}/movies/${movieId}/reviews`);
        if (!response.ok) return [];
        return await response.json();
    },

    async getUserReview(userId, movieId) {
        const response = await fetch(`${API_URL}/users/${userId}/reviews/${movieId}`);
        if (!response.ok) return null;
        return await response.json();
    },

    async addReview(userId, movieId, rating, comment) {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, movieId, rating, comment })
        });
        if (!response.ok) throw new Error('Failed to add review');
        return await response.json();
    },

    async updateReview(reviewId, updates) {
        console.log('Update review not implemented');
    },
};



// Comments Services
export const commentService = {
    async getMovieComments(movieId, limit = 20) {
        const response = await fetch(`${API_URL}/movies/${movieId}/comments`);
        if (!response.ok) return [];
        return await response.json();
    },

    async addComment(userId, movieId, content, parentCommentId = null) {
        const response = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, movieId, content, parentCommentId })
        });
        if (!response.ok) throw new Error('Failed to add comment');
        return await response.json();
    },

    async updateComment(commentId, userId, updates) {
        // TODO: Implement update
    },

    async deleteComment(commentId, userId) {
        const response = await fetch(`${API_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        if (!response.ok) throw new Error('Failed to delete comment');
        return await response.json();
    },

    async likeComment(commentId, userId) {
        const response = await fetch(`${API_URL}/comments/${commentId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        if (!response.ok) throw new Error('Failed to like comment');
        return await response.json();
    }
};

export const notificationService = {
    async getUserNotifications(userId, limit = 20) {
        const response = await fetch(`${API_URL}/users/${userId}/notifications`);
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return await response.json();
    },

    async markAsRead(notificationId, userId) {
    },

    async markAllAsRead(userId) {
    }
};

export const marketService = {
    async getItems() {
        const response = await fetch(`${API_URL}/items`);
        if (!response.ok) throw new Error('Failed to fetch items');
        return await response.json();
    },

    async getUserInventory(userId) {
        const response = await fetch(`${API_URL}/users/${userId}/inventory`);
        if (!response.ok) throw new Error('Failed to fetch inventory');
        return await response.json();
    },

    async buyItem(userId, itemId) {
        const response = await fetch(`${API_URL}/market/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, itemId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Purchase failed');
        return data;
    }
};

export const playlistService = {
    async getUserPlaylists(userId) {
        const response = await fetch(`${API_URL}/users/${userId}/playlists`);
        if (!response.ok) return [];
        return await response.json();
    },

    async createPlaylist(userId, name) {
        const response = await fetch(`${API_URL}/playlists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, name })
        });
        return await response.json();
    },

    async addToPlaylist(playlistId, movieId) {
        await fetch(`${API_URL}/playlists/${playlistId}/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId })
        });
    },

    async getPlaylistMovies(playlistId) {
        const response = await fetch(`${API_URL}/playlists/${playlistId}/movies`);
        if (!response.ok) return [];
        return await response.json();
    }
};

export const gamificationService = {
    async getLeaderboard() {
        const response = await fetch(`${API_URL}/leaderboard`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        return await response.json();
    }
};

export const watchHistoryService = {
    async getHistory(userId) {
        const response = await fetch(`${API_URL}/users/${userId}/history`);
        if (!response.ok) return [];
        return await response.json();
    },

    async updateWatchProgress(userId, movieId, progressSeconds, episodeId = null) {
        const response = await fetch(`${API_URL}/watch-history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, movieId, progressSeconds, episodeId })
        });
        if (!response.ok) throw new Error('Failed to update watch history');
        return await response.json();
    },

    async getWatchProgress(userId, movieId) {
        const response = await fetch(`${API_URL}/watch-history/${userId}/${movieId}`);
        if (!response.ok) return { progress_seconds: 0, episode_id: null };
        return await response.json();
    },

    async getRecentWatched(userId, limit = 5) {
        const response = await fetch(`${API_URL}/users/${userId}/history?limit=${limit}`);
        if (!response.ok) return [];
        return await response.json();
    }
};

export const adminService = {
    // Movie Management
    addMovie: async (movieData) => {
        const response = await fetch(`${API_URL}/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData)
        });
        if (!response.ok) throw new Error('Failed to add movie');
        return await response.json();
    },

    updateMovie: async (id, movieData) => {
        const response = await fetch(`${API_URL}/movies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData)
        });
        if (!response.ok) throw new Error('Failed to update movie');
        return await response.json();
    },

    deleteMovie: async (id) => {
        const response = await fetch(`${API_URL}/movies/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete movie');
        return await response.json();
    },

    // Episode Management
    addEpisode: async (episodeData) => {
        const response = await fetch(`${API_URL}/episodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(episodeData)
        });
        if (!response.ok) throw new Error('Failed to add episode');
        return await response.json();
    },

    updateEpisode: async (id, episodeData) => {
        const response = await fetch(`${API_URL}/episodes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(episodeData)
        });
        if (!response.ok) throw new Error('Failed to update episode');
        return await response.json();
    },

    deleteEpisode: async (id) => {
        const response = await fetch(`${API_URL}/episodes/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete episode');
        return await response.json();
    },

    // User Management
    getAllUsers: async () => {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    },

    updateUser: async (id, userData) => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Failed to update user');
        return await response.json();
    },

    deleteUser: async (id) => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return await response.json();
    }
};
