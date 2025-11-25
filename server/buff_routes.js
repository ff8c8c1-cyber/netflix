// Stats Routes - Using Supabase RPC Functions
const express = require('express');
const router = express.Router();
const { supabase } = require('./supabase');

// Helper function to convert snake_case to camelCase
function toCamelCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(v => toCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            result[camelKey] = toCamelCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
}

// GET /api/users/:userId/stats - Get user stats with buffs
router.get('/:userId/stats', async (req, res) => {
    const { userId } = req.params;

    try {
        // Call PostgreSQL function
        const { data, error } = await supabase
            .rpc('get_user_stats', { p_user_id: parseInt(userId) });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({
            message: 'Failed to get stats',
            error: err.message
        });
    }
});

// POST /api/users/:userId/stats/recalculate - Recalculate stats
router.post('/:userId/stats/recalculate', async (req, res) => {
    const { userId } = req.params;

    try {
        const { data, error } = await supabase
            .rpc('calculate_total_stats', { p_user_id: parseInt(userId) });

        if (error) throw error;

        res.json({
            success: true,
            stats: data[0]
        });
    } catch (err) {
        console.error('Recalculate stats error:', err);
        res.status(500).json({
            message: 'Failed to recalculate stats',
            error: err.message
        });
    }
});

// POST /api/users/:userId/stats/initialize - Initialize stats by rank
router.post('/:userId/stats/initialize', async (req, res) => {
    const { userId } = req.params;
    const { rank } = req.body;

    try {
        const { data, error } = await supabase
            .rpc('initialize_user_stats', {
                p_user_id: parseInt(userId),
                p_rank: parseInt(rank)
            });

        if (error) throw error;

        res.json({
            success: true,
            message: data[0].message
        });
    } catch (err) {
        console.error('Initialize stats error:', err);
        res.status(500).json({
            message: 'Failed to initialize stats',
            error: err.message
        });
    }
});

module.exports = router;

