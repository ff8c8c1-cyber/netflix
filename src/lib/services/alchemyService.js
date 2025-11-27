```typescript
import { apiClient } from '../api/apiClient';

class AlchemyService {
    async getRecipes(userId) {
        const endpoint = userId 
            ? `/ api / alchemy / recipes ? userId = ${ userId } `
            : `/ api / alchemy / recipes`;
        
        return apiClient.get(endpoint);
    }

    async getRecipeDetails(pillId, userId) {
        const endpoint = userId
            ? `/ api / alchemy / recipes / ${ pillId }?userId = ${ userId } `
            : `/ api / alchemy / recipes / ${ pillId } `;
        
        return apiClient.get(endpoint);
    }

    async craftPill(userId, pillId, qteScore) {
        return apiClient.post('/api/alchemy/craft', {
            userId,
            pillId,
            qteScore
        });
    }

    async getCraftingHistory(userId, limit = 50) {
        return apiClient.get(`/ api / alchemy / history / ${ userId }?limit = ${ limit } `);
    }
}

export const alchemyService = new AlchemyService();
```
