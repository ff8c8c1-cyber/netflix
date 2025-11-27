const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { CacheService, CACHE_KEYS } = require('../utils/cache');

// Helper to convert PascalCase to snake_case
const toSnakeCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => toSnakeCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
            result[snakeKey] = toSnakeCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
};

// ============================================
// GET /api/alchemy/recipes
// Get all pill recipes available to user
// ============================================
router.get('/recipes', async (req, res) => {
    try {
        const { userId } = req.query;

        // Get user rank to determine unlocked recipes
        let userRank = 0;
        if (userId) {
            const { data: user } = await supabase
                .from('Users')
                .select('Rank')
                .eq('Id', userId)
                .single();
            userRank = user?.Rank || 0;
        }

        // OPTIMIZED: Cache pills, recipes, and herbs data (static)
        const [pills, recipes, herbs] = await Promise.all([
            CacheService.getOrSet('static', CACHE_KEYS.ALL_PILLS, async () => {
                const { data, error } = await supabase
                    .from('Items')
                    .select('*')
                    .like('Type', 'pill_%')
                    .order('Price', { ascending: true });

                if (error) throw error;
                return data;
            }),
            CacheService.getOrSet('static', 'recipes:all', async () => {
                const { data, error } = await supabase
                    .from('PillRecipes')
                    .select('*');

                if (error) throw error;
                return data;
            }),
            CacheService.getOrSet('static', CACHE_KEYS.ALL_HERBS, async () => {
                const { data } = await supabase
                    .from('Items')
                    .select('*')
                    .eq('Type', 'herb');

                return data || [];
            })
        ]);

        const herbsMap = {};
        herbs.forEach(herb => {
            herbsMap[herb.Id] = herb;
        });

        // Group recipes by pill
        const recipesMap = {};
        recipes.forEach(recipe => {
            if (!recipesMap[recipe.PillId]) {
                recipesMap[recipe.PillId] = [];
            }
            recipesMap[recipe.PillId].push({
                herbId: recipe.HerbId,
                herbName: herbsMap[recipe.HerbId]?.Name || 'Unknown',
                herbIcon: herbsMap[recipe.HerbId]?.IconUrl || '🌿',
                quantity: recipe.Quantity
            });
        });

        // Determine unlock status based on rarity and rank
        const rarityRankMap = {
            'common': 0,
            'uncommon': 3,
            'rare': 6,
            'epic': 9,
            'legendary': 12
        };

        const pillsWithRecipes = pills.map(pill => {
            const requiredRank = rarityRankMap[pill.Rarity] || 0;
            const unlocked = userRank >= requiredRank;

            return {
                id: pill.Id,
                name: pill.Name,
                type: pill.Type,
                rarity: pill.Rarity,
                description: pill.Description,
                effect: pill.Effect,
                price: pill.Price,
                iconUrl: pill.IconUrl || '💊',
                requiredRank,
                unlocked,
                ingredients: recipesMap[pill.Id] || [],
                hasRecipe: (recipesMap[pill.Id] || []).length > 0
            };
        });

        res.json({
            recipes: toSnakeCase(pillsWithRecipes),
            userRank
        });

    } catch (err) {
        console.error('Get recipes error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ============================================
// GET /api/alchemy/recipes/:pillId
// Get specific recipe details
// ============================================
router.get('/recipes/:pillId', async (req, res) => {
    try {
        const { pillId } = req.params;
        const { userId } = req.query;

        // Get pill details
        const { data: pill, error: pillError } = await supabase
            .from('Items')
            .select('*')
            .eq('Id', pillId)
            .single();

        if (pillError || !pill) {
            return res.status(404).json({ message: 'Pill not found' });
        }

        // Get recipe ingredients
        const { data: recipeItems } = await supabase
            .from('PillRecipes')
            .select('*')
            .eq('PillId', pillId);

        // Get herb details
        const herbIds = (recipeItems || []).map(r => r.HerbId);
        const { data: herbs } = await supabase
            .from('Items')
            .select('*')
            .in('Id', herbIds);

        const herbsMap = {};
        (herbs || []).forEach(herb => {
            herbsMap[herb.Id] = herb;
        });

        const ingredients = (recipeItems || []).map(recipe => ({
            herbId: recipe.HerbId,
            herbName: herbsMap[recipe.HerbId]?.Name || 'Unknown',
            herbIcon: herbsMap[recipe.HerbId]?.IconUrl || '🌿',
            quantity: recipe.Quantity,
            price: herbsMap[recipe.HerbId]?.Price || 0
        }));

        // Check user inventory if userId provided
        // OPTIMIZED: Only fetch herbs needed for this recipe
        let userIngredients = {};
        if (userId && herbIds.length > 0) {
            const { data: inventory, error: invError } = await supabase
                .from('UserInventory')
                .select('ItemId, Quantity')
                .eq('UserId', userId)
                .in('ItemId', herbIds); // Only get needed herbs

            if (invError) {
                console.error('Inventory fetch error:', invError);
            }

            // Build inventory map from filtered items
            (inventory || []).forEach(item => {
                userIngredients[item.ItemId] = item.Quantity;
            });
        }

        // Calculate success rate (base)
        const baseRate = {
            'common': 70,
            'uncommon': 60,
            'rare': 50,
            'epic': 40,
            'legendary': 30
        }[pill.Rarity] || 50;

        res.json({
            pill: toSnakeCase(pill),
            ingredients: toSnakeCase(ingredients),
            user_inventory: userIngredients,
            can_craft: ingredients.every(ing => (userIngredients[ing.herbId] || 0) >= ing.quantity),
            base_success_rate: baseRate
        });

    } catch (err) {
        console.error('Get recipe error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ============================================
// POST /api/alchemy/craft
// Craft a pill with QTE score
// ============================================
router.post('/craft', async (req, res) => {
    try {
        const { userId, pillId, qteScore = 50 } = req.body;

        if (!userId || !pillId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get user data
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('Rank, AlchemyLevel, VipStatus, AlchemyExp')
            .eq('Id', userId)
            .single();

        if (userError) throw userError;

        // Get pill and recipe
        const { data: pill } = await supabase
            .from('Items')
            .select('*')
            .eq('Id', pillId)
            .single();

        if (!pill) {
            return res.status(404).json({ message: 'Pill not found' });
        }

        const { data: recipeItems } = await supabase
            .from('PillRecipes')
            .select('*')
            .eq('PillId', pillId);

        if (!recipeItems || recipeItems.length === 0) {
            return res.status(400).json({ message: 'No recipe found for this pill' });
        }

        // Check user has ingredients
        const herbIds = recipeItems.map(r => r.HerbId);
        const { data: userInventory } = await supabase
            .from('UserInventory')
            .select('*')
            .eq('UserId', userId)
            .in('ItemId', herbIds);

        const inventoryMap = {};
        (userInventory || []).forEach(item => {
            inventoryMap[item.ItemId] = item.Quantity;
        });

        // Verify sufficient ingredients
        for (const recipe of recipeItems) {
            const available = inventoryMap[recipe.HerbId] || 0;
            if (available < recipe.Quantity) {
                const { data: herb } = await supabase
                    .from('Items')
                    .select('Name')
                    .eq('Id', recipe.HerbId)
                    .single();

                return res.status(400).json({
                    message: `Không đủ ${herb?.Name || 'nguyên liệu'}! Cần ${recipe.Quantity}, có ${available}`
                });
            }
        }

        // Calculate success rate
        const baseRate = {
            'common': 70,
            'uncommon': 60,
            'rare': 50,
            'epic': 40,
            'legendary': 30
        }[pill.Rarity] || 50;

        const rankBonus = (user.Rank || 0) * 2;
        const qteBonus = (qteScore || 50) * 0.3;
        const vipBonus = user.VipStatus !== 'none' ? 10 : 0;
        const alchemyBonus = (user.AlchemyLevel || 1) * 1.5;

        const finalRate = Math.min(95, baseRate + rankBonus + qteBonus + vipBonus + alchemyBonus);

        // Roll for success
        const roll = Math.random() * 100;
        const success = roll < finalRate;

        // Deduct ingredients (full for success, 50% for failure)
        for (const recipe of recipeItems) {
            const lossRate = success ? 1 : 0.5;
            const newQuantity = inventoryMap[recipe.HerbId] - Math.ceil(recipe.Quantity * lossRate);

            if (newQuantity <= 0) {
                await supabase
                    .from('UserInventory')
                    .delete()
                    .eq('UserId', userId)
                    .eq('ItemId', recipe.HerbId);
            } else {
                await supabase
                    .from('UserInventory')
                    .update({ Quantity: newQuantity })
                    .eq('UserId', userId)
                    .eq('ItemId', recipe.HerbId);
            }
        }

        let quality = 'normal';
        let qualityMultiplier = 1.0;

        if (success) {
            // Calculate quality
            const qualityRoll = Math.random() * 100 + (qteScore || 50);
            if (qualityRoll > 150) {
                quality = 'perfect';
                qualityMultiplier = 1.5;
            } else if (qualityRoll > 120) {
                quality = 'superior';
                qualityMultiplier = 1.2;
            } else if (qualityRoll > 80) {
                quality = 'normal';
                qualityMultiplier = 1.0;
            } else {
                quality = 'poor';
                qualityMultiplier = 0.8;
            }

            // Add pill to inventory
            const { data: existingPill } = await supabase
                .from('UserInventory')
                .select('Quantity')
                .eq('UserId', userId)
                .eq('ItemId', pillId)
                .maybeSingle();

            if (existingPill) {
                await supabase
                    .from('UserInventory')
                    .update({ Quantity: existingPill.Quantity + 1 })
                    .eq('UserId', userId)
                    .eq('ItemId', pillId);
            } else {
                await supabase
                    .from('UserInventory')
                    .insert({
                        UserId: userId,
                        ItemId: pillId,
                        Quantity: 1
                    });
            }
        }

        // Calculate alchemy exp
        const expGained = success ? Math.floor(pill.Price / 10) : Math.floor(pill.Price / 20);

        // Log crafting history
        await supabase
            .from('CraftingHistory')
            .insert({
                UserId: userId,
                PillId: pillId,
                Success: success,
                Quality: quality,
                QTEScore: qteScore,
                ExpGained: expGained
            });

        // Update alchemy exp
        const newAlchemyExp = (user.AlchemyExp || 0) + expGained;
        const newAlchemyLevel = Math.floor(newAlchemyExp / 1000) + 1;

        await supabase
            .from('Users')
            .update({
                AlchemyExp: newAlchemyExp,
                AlchemyLevel: newAlchemyLevel
            })
            .eq('Id', userId);

        res.json({
            success,
            quality,
            qualityMultiplier,
            finalSuccessRate: Math.round(finalRate * 10) / 10,
            expGained,
            newAlchemyLevel,
            message: success
                ? `Luyện thành công ${pill.Name} (${quality})!`
                : `Thất bại! Đan lò nổ tung, mất 50% nguyên liệu.`
        });

    } catch (err) {
        console.error('Craft error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ============================================
// GET /api/alchemy/history/:userId
// Get crafting history
// ============================================
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50 } = req.query;

        const { data: history, error } = await supabase
            .from('CraftingHistory')
            .select('*')
            .eq('UserId', userId)
            .order('CraftedAt', { ascending: false })
            .limit(parseInt(limit));

        if (error) throw error;

        // Get pill names
        const pillIds = [...new Set(history.map(h => h.PillId))];
        const { data: pills } = await supabase
            .from('Items')
            .select('Id, Name, IconUrl')
            .in('Id', pillIds);

        const pillsMap = {};
        (pills || []).forEach(pill => {
            pillsMap[pill.Id] = pill;
        });

        const enrichedHistory = history.map(record => ({
            ...toSnakeCase(record),
            pill_name: pillsMap[record.PillId]?.Name || 'Unknown',
            pill_icon: pillsMap[record.PillId]?.IconUrl || '💊'
        }));

        res.json({
            history: enrichedHistory,
            total: history.length
        });

    } catch (err) {
        console.error('Get history error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
