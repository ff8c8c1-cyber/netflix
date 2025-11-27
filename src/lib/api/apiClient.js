import { API_BASE_URL } from '../config/api';
import { authService } from '../services/authService';

/**
 * API Client with automatic token injection
 */

class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    /**
     * Make authenticated request
     */
    async request(endpoint, options = {}) {
        // Get access token
        const token = await authService.getAccessToken();

        // Build headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add Authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Make request
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);

            // Handle 401 - token expired
            if (response.status === 401) {
                // Try to refresh token
                const newSession = await authService.refreshSession();

                if (newSession) {
                    // Retry request with new token
                    headers['Authorization'] = `Bearer ${newSession.access_token}`;
                    const retryResponse = await fetch(url, { ...config, headers });
                    return this.handleResponse(retryResponse);
                } else {
                    // Refresh failed, logout user
                    await authService.logout();
                    window.location.href = '/login';
                    throw new Error('Session expired, please login again');
                }
            }

            return this.handleResponse(response);
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Handle response
     */
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Request failed');
            }

            return data;
        }

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        return response;
    }

    // HTTP methods
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

// Create singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
