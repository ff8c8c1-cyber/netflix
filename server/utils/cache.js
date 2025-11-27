/**
 * Caching Service
 * Simple in-memory cache for frequently accessed data
 */

const NodeCache = require('node-cache');

// Create cache instances with different TTLs
const staticCache = new NodeCache({
    stdTTL: 600, // 10 minutes for static data
    checkperiod: 120 // Check for expired keys every 2 minutes
});

const dynamicCache = new NodeCache({
    stdTTL: 60, // 1 minute for dynamic data
    checkperiod: 20
});

/**
 * Cache wrapper with automatic key generation
 */
class CacheService {
    /**
     * Get from cache or execute function and cache result
     */
    static async getOrSet(cacheType, key, fetchFunction, ttl = null) {
        const cache = cacheType === 'static' ? staticCache : dynamicCache;

        // Try to get from cache
        const cached = cache.get(key);
        if (cached !== undefined) {
            return cached;
        }

        // Not in cache, fetch and store
        try {
            const result = await fetchFunction();
            cache.set(key, result, ttl || undefined);
            return result;
        } catch (error) {
            console.error('Cache fetch error:', error);
            throw error;
        }
    }

    /**
     * Invalidate specific cache key
     */
    static invalidate(cacheType, key) {
        const cache = cacheType === 'static' ? staticCache : dynamicCache;
        cache.del(key);
    }

    /**
     * Invalidate all cache entries matching pattern
     */
    static invalidatePattern(cacheType, pattern) {
        const cache = cacheType === 'static' ? staticCache : dynamicCache;
        const keys = cache.keys();

        keys.forEach(key => {
            if (key.includes(pattern)) {
                cache.del(key);
            }
        });
    }

    /**
     * Clear all cache
     */
    static clearAll() {
        staticCache.flushAll();
        dynamicCache.flushAll();
    }

    /**
     * Get cache stats
     */
    static getStats() {
        return {
            static: {
                keys: staticCache.keys().length,
                hits: staticCache.getStats().hits,
                misses: staticCache.getStats().misses
            },
            dynamic: {
                keys: dynamicCache.keys().length,
                hits: dynamicCache.getStats().hits,
                misses: dynamicCache.getStats().misses
            }
        };
    }
}

// Predefined cache keys for common data
const CACHE_KEYS = {
    ALL_ITEMS: 'items:all',
    ALL_HERBS: 'items:herbs',
    ALL_PILLS: 'items:pills',
    PILL_RECIPES: (pillId) => `recipes:pill:${pillId}`,
    USER_INVENTORY: (userId) => `inventory:user:${userId}`,
    LEADERBOARD: 'leaderboard:pvp',
};

module.exports = {
    CacheService,
    CACHE_KEYS,
    staticCache,
    dynamicCache
};
