import { API_BASE_URL } from '../../config/api';

class AlchemyService {
    async getRecipes(userId) {
        const url = userId
            ? `${API_BASE_URL}/api/alchemy/recipes?userId=${userId}`
            : `${API_BASE_URL}/api/alchemy/recipes`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch recipes');
        return response.json();
    }

    async getRecipeDetails(pillId, userId) {
        const url = userId
            ? `${API_BASE_URL}/api/alchemy/recipes/${pillId}?userId=${userId}`
            : `${API_BASE_URL}/api/alchemy/recipes/${pillId}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch recipe details');
        return response.json();
    }

    async craftPill(userId, pillId, qteScore) {
        const response = await fetch(`${API_BASE_URL}/api/alchemy/craft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, pillId, qteScore })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to craft pill');
        }
        return data;
    }

    async getCraftingHistory(userId, limit = 50) {
        const response = await fetch(
            `${API_BASE_URL}/api/alchemy/history/${userId}?limit=${limit}`
        );
        if (!response.ok) throw new Error('Failed to fetch crafting history');
        return response.json();
    }
}

export const alchemyService = new AlchemyService();
