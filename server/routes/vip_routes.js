const { supabase } = require('../config/supabase');

// Get user's VIP status
const getVipStatus = async (req, res) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabase
            .from('Users')
            .select('VipStatus, VipExpiresAt')
            .eq('Id', userId)
            .single();

        if (error) throw error;

        res.json({
            vipStatus: data?.VipStatus || 'none',
            vipExpiresAt: data?.VipExpiresAt || null
        });
    } catch (err) {
        console.error('VIP Status Error:', err);
        res.json({ vipStatus: 'none', vipExpiresAt: null });
    }
};

module.exports = { getVipStatus };
