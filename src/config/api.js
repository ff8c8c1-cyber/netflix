export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://netflix-es1d.onrender.com';

export const getApiUrl = (endpoint) => {
    return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};
