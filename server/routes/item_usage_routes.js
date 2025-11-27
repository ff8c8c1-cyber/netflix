// ============================================
// ITEM USAGE SYSTEM
// ============================================

// Use an item (pill, consumable, etc.)
app.post('/api/items/use', async (req, res) => {
    try {
        const { userId, itemId, quantity = 1 } = req.body;

        if (!userId || !itemId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get item details
        const { data: item, error: itemError } = await supabase
            .from('Items')
            .select('*')
            .eq('Id', itemId)
            .single();

        if (itemError || !item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check user has item in inventory
        const { data: inventoryItem, error: invError } = await supabase
            .from('UserInventory')
            .select('Quantity')
            .eq('UserId', userId)
            .eq('ItemId', itemId)
            .single();

        if (invError || !inventoryItem || inventoryItem.Quantity < quantity) {
            return res.status(400).json({ message: 'Not enough items in inventory' });
        }

        // Get user current stats
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('Exp, Rank, Stones')
            .eq('Id', userId)
            .single();

        if (userError) throw userError;

        let effect = {};
        let updateData = {};

        // Apply effect based on item type
        switch (item.Type) {
            case 'pill_exp':
                // EXP Pill - instant EXP gain
                const expGain = parseInt(item.Effect) || 100;
                updateData.Exp = user.Exp + expGain;
                effect = {
                    type: 'exp',
                    value: expGain,
                    message: `Gained ${expGain} EXP!`
                };
                break;

            case 'pill_hp':
            case 'pill_atk':
            case 'pill_def':
            case 'pill_spd':
                // Buff pills - create temporary buff
                const buffType = item.Type.replace('pill_', '');
                const buffValue = parseInt(item.Effect) || 20; // Default 20%
                const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

                const { error: buffError } = await supabase
                    .from('UserBuffs')
                    .insert({
                        UserId: userId,
                        BuffType: buffType,
                        BuffValue: buffValue,
                        IsPercentage: true,
                        ExpiresAt: expiresAt.toISOString(),
                        SourceItemId: itemId,
                        Active: true
                    });

                if (buffError) throw buffError;

                effect = {
                    type: 'buff',
                    buffType: buffType,
                    value: buffValue,
                    duration: 1800, // 30 min in seconds
                    message: `${buffType.toUpperCase()} increased by ${buffValue}% for 30 minutes!`
                };
                break;

            default:
                return res.status(400).json({ message: 'Unknown item type' });
        }

        // Update user if needed (for EXP pills)
        if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
                .from('Users')
                .update(updateData)
                .eq('Id', userId);

            if (updateError) throw updateError;
        }

        // Remove item from inventory
        const newQuantity = inventoryItem.Quantity - quantity;
        if (newQuantity <= 0) {
            await supabase
                .from('UserInventory')
                .delete()
                .eq('UserId', userId)
                .eq('ItemId', itemId);
        } else {
            await supabase
                .from('UserInventory')
                .update({ Quantity: newQuantity })
                .eq('UserId', userId)
                .eq('ItemId', itemId);
        }

        // Log usage
        await supabase
            .from('ItemUsageLog')
            .insert({
                UserId: userId,
                ItemId: itemId,
                Quantity: quantity,
                EffectApplied: JSON.stringify(effect),
                Success: true
            });

        // Get updated stats
        const { data: updatedUser } = await supabase
            .from('Users')
            .select('Exp, Rank, Stones')
            .eq('Id', userId)
            .single();

        res.json({
            success: true,
            effect,
            updatedStats: updatedUser,
            remainingQuantity: newQuantity > 0 ? newQuantity : 0
        });

    } catch (err) {
        console.error('Item usage error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's active buffs
app.get('/api/users/:userId/buffs', async (req, res) => {
    try {
        const { userId } = req.params;

        // Delete expired buffs first
        await supabase
            .from('UserBuffs')
            .delete()
            .lt('ExpiresAt', new Date().toISOString())
            .not('ExpiresAt', 'is', null);

        // Get active buffs (removed auto-join which doesn't work)
        const { data: buffs, error } = await supabase
            .from('UserBuffs')
            .select('*')
            .eq('UserId', userId)
            .eq('Active', true)
            .or(`ExpiresAt.is.null,ExpiresAt.gt.${new Date().toISOString()}`);

        if (error) throw error;

        // Get item details manually if buffs exist
        let itemsMap = {};
        if (buffs && buffs.length > 0) {
            const itemIds = buffs.map(b => b.SourceItemId).filter(Boolean);
            if (itemIds.length > 0) {
                const { data: itemsData } = await supabase
                    .from('Items')
                    .select('Id, Name, IconUrl')
                    .in('Id', itemIds);

                if (itemsData) {
                    itemsData.forEach(item => {
                        itemsMap[item.Id] = item;
                    });
                }
            }
        }

        // Calculate remaining time
        const buffsList = (buffs || []).map(buff => {
            const item = itemsMap[buff.SourceItemId] || {};
            return {
                id: buff.Id,
                type: buff.BuffType,
                value: buff.BuffValue,
                isPercentage: buff.IsPercentage,
                appliedAt: buff.AppliedAt,
                expiresAt: buff.ExpiresAt,
                itemName: item.Name || buff.BuffType.toUpperCase(),
                itemIcon: item.IconUrl || '',
                remainingSeconds: buff.ExpiresAt
                    ? Math.max(0, Math.floor((new Date(buff.ExpiresAt) - new Date()) / 1000))
                    : null
            };
        });

        res.json({ buffs: buffsList });

    } catch (err) {
        console.error('Get buffs error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's total calculated stats (including buffs)
app.get('/api/users/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user base stats
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('Rank, Exp')
            .eq('Id', userId)
            .single();

        if (userError) throw userError;

        // Get base stats from rank (simplified - you can expand this)
        const baseStats = {
            hp: 100 + (user.Rank * 50),
            atk: 10 + (user.Rank * 5),
            def: 5 + (user.Rank * 3),
            spd: 10 + (user.Rank * 2)
        };

        // Get active buffs
        const { data: buffs } = await supabase
            .from('UserBuffs')
            .select('BuffType, BuffValue, IsPercentage')
            .eq('UserId', userId)
            .eq('Active', true)
            .or(`ExpiresAt.is.null,ExpiresAt.gt.${new Date().toISOString()}`);

        // Calculate total stats with buffs
        let totalStats = { ...baseStats };

        if (buffs && buffs.length > 0) {
            buffs.forEach(buff => {
                if (totalStats[buff.BuffType] !== undefined) {
                    if (buff.IsPercentage) {
                        totalStats[buff.BuffType] = Math.floor(
                            totalStats[buff.BuffType] * (1 + buff.BuffValue / 100)
                        );
                    } else {
                        totalStats[buff.BuffType] += buff.BuffValue;
                    }
                }
            });
        }

        res.json({
            baseStats,
            totalStats,
            buffsApplied: buffs?.length || 0
        });

    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
