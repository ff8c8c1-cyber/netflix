const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Helper: Update Mission Progress
const updateMissionProgress = async (userId, type, amount = 1) => {
    try {
        // Find relevant missions
        const { data: missions } = await supabase
            .from('SectMissions')
            .select('*')
            .eq('RequirementType', type);

        if (!missions || missions.length === 0) return;

        for (const m of missions) {
            // Check/Create UserMission for today
            const today = new Date().toISOString().split('T')[0];

            const { data: um } = await supabase
                .from('UserMissions')
                .select('*')
                .eq('UserId', userId)
                .eq('MissionId', m.Id)
                .gte('LastUpdated', today + 'T00:00:00')
                .lt('LastUpdated', today + 'T23:59:59')
                .maybeSingle();

            if (!um) {
                // Create new record for today
                await supabase.from('UserMissions').insert({
                    UserId: userId,
                    MissionId: m.Id,
                    Progress: amount,
                    LastUpdated: new Date().toISOString()
                });
            } else {
                // Update existing
                if (!um.IsClaimed) {
                    await supabase
                        .from('UserMissions')
                        .update({
                            Progress: um.Progress + amount,
                            LastUpdated: new Date().toISOString()
                        })
                        .eq('Id', um.Id);
                }
            }
        }
    } catch (err) {
        console.error('Error updating mission progress:', err);
    }
};

// 1. Get All Sects
router.get('/', async (req, res) => {
    try {
        const { data: sects, error } = await supabase
            .from('Sects')
            .select('*, Users!LeaderId(Username), SectMembers(count)');

        if (error) throw error;

        const result = sects.map(s => ({
            ...s,
            LeaderName: s.Users?.Username,
            MemberCount: s.SectMembers[0]?.count || 0
        })).sort((a, b) => b.Level - a.Level || b.Resources - a.Resources);

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching sects' });
    }
});

// 2. Get My Sect
router.get('/my', async (req, res) => {
    const { userId } = req.query;
    try {
        const { data: member } = await supabase
            .from('SectMembers')
            .select('*')
            .eq('UserId', userId)
            .maybeSingle();

        if (!member) return res.json(null);

        const sectId = member.SectId;

        // Trigger Login Mission
        updateMissionProgress(userId, 'Login', 1);

        // Get Sect Details
        const { data: sect } = await supabase
            .from('Sects')
            .select('*, Users!LeaderId(Username)')
            .eq('Id', sectId)
            .single();

        // Get Members
        const { data: members } = await supabase
            .from('SectMembers')
            .select('*, Users(Username, Rank)')
            .eq('SectId', sectId);

        // Sort Members
        const roleOrder = { 'Leader': 1, 'Elder': 2, 'Core': 3, 'Inner': 4, 'Outer': 5 };
        const sortedMembers = members.map(m => ({
            ...m,
            Username: m.Users?.Username,
            Rank: m.Users?.Rank
        })).sort((a, b) => (roleOrder[a.Role] || 5) - (roleOrder[b.Role] || 5));

        // Get Buildings
        const { data: buildings } = await supabase
            .from('SectBuildings')
            .select('*')
            .eq('SectId', sectId);

        res.json({
            sect: { ...sect, LeaderName: sect.Users?.Username },
            member,
            members: sortedMembers,
            buildings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching my sect' });
    }
});

// 3. Create Sect
router.post('/', async (req, res) => {
    const { userId, name, description } = req.body;
    try {
        const { data: existingMember } = await supabase
            .from('SectMembers')
            .select('Id')
            .eq('UserId', userId)
            .maybeSingle();

        if (existingMember) return res.status(400).json({ message: 'Already in a sect' });

        const { data: nameCheck } = await supabase
            .from('Sects')
            .select('Id')
            .eq('Name', name)
            .maybeSingle();

        if (nameCheck) return res.status(400).json({ message: 'Sect name taken' });

        const { data: newSect, error } = await supabase
            .from('Sects')
            .insert({
                Name: name,
                Description: description,
                LeaderId: userId,
                Level: 1,
                Resources: 100
            })
            .select()
            .single();

        if (error) throw error;
        const sectId = newSect.Id;

        await supabase.from('SectMembers').insert({
            SectId: sectId,
            UserId: userId,
            Role: 'Leader',
            Contribution: 100
        });

        await supabase.from('SectBuildings').insert([
            { SectId: sectId, Type: 'MainHall', Level: 1 },
            { SectId: sectId, Type: 'Pavilion', Level: 1 },
            { SectId: sectId, Type: 'Alchemy', Level: 1 },
            { SectId: sectId, Type: 'Vein', Level: 1 },
            { SectId: sectId, Type: 'Mission', Level: 1 }
        ]);

        res.json({ success: true, sectId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating sect' });
    }
});

// 4. Join Sect
router.post('/join', async (req, res) => {
    const { userId, sectId } = req.body;
    try {
        const { data: existingMember } = await supabase
            .from('SectMembers')
            .select('Id')
            .eq('UserId', userId)
            .maybeSingle();

        if (existingMember) return res.status(400).json({ message: 'Already in a sect' });

        // 1. Add to SectMembers
        const { error: memberError } = await supabase.from('SectMembers').insert({
            SectId: sectId,
            UserId: userId,
            Role: 'Outer',
            Contribution: 0
        });

        if (memberError) throw memberError;

        // 2. Update Users table
        const { error: userError } = await supabase
            .from('Users')
            .update({ SectId: sectId })
            .eq('Id', userId);

        if (userError) throw userError;

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error joining sect' });
    }
});

// 5. Contribute (Donate)
router.post('/contribute', async (req, res) => {
    const { userId, amount } = req.body; // Amount in Stones
    try {
        // 1. Check User Balance
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('Stones')
            .eq('Id', userId)
            .single();

        if (userError || !user) return res.status(404).json({ message: 'User not found' });
        if (user.Stones < amount) {
            return res.status(400).json({ message: 'Không đủ Linh Thạch!' });
        }

        // 2. Check Sect Membership
        const { data: member, error: memberError } = await supabase
            .from('SectMembers')
            .select('*')
            .eq('UserId', userId)
            .maybeSingle();

        if (memberError || !member) return res.status(400).json({ message: 'Not in a sect' });
        const sectId = member.SectId;

        // 3. Execute Transaction (Sequential)
        // Deduct User Stones
        await supabase.from('Users').update({ Stones: user.Stones - amount }).eq('Id', userId);

        // Add Sect Resources
        // Fetch current resources first (no atomic increment via API without RPC)
        const { data: sect } = await supabase.from('Sects').select('Resources').eq('Id', sectId).single();
        await supabase.from('Sects').update({ Resources: (sect.Resources || 0) + amount }).eq('Id', sectId);

        // Add Member Contribution
        await supabase.from('SectMembers').update({ Contribution: (member.Contribution || 0) + amount }).eq('UserId', userId);

        // Trigger Contribute Mission
        updateMissionProgress(userId, 'Contribute', amount);

        res.json({ success: true, remainingStones: user.Stones - amount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error contributing' });
    }
});

// 6. Upgrade Building
router.post('/upgrade', async (req, res) => {
    const { userId, buildingType } = req.body;
    try {
        // Verify Leader/Elder
        const { data: member } = await supabase
            .from('SectMembers')
            .select('*')
            .eq('UserId', userId)
            .maybeSingle();

        if (!member || (member.Role !== 'Leader' && member.Role !== 'Elder')) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        const sectId = member.SectId;

        // Get Building
        const { data: building } = await supabase
            .from('SectBuildings')
            .select('*')
            .eq('SectId', sectId)
            .eq('Type', buildingType)
            .single();

        if (!building) return res.status(404).json({ message: 'Building not found' });

        // Cost Logic (Level * 1000)
        const cost = building.Level * 1000;

        // Check Resources
        const { data: sect } = await supabase.from('Sects').select('Resources').eq('Id', sectId).single();
        if (sect.Resources < cost) {
            return res.status(400).json({ message: 'Not enough resources' });
        }

        // Execute Upgrade
        await supabase.from('Sects').update({ Resources: sect.Resources - cost }).eq('Id', sectId);
        await supabase.from('SectBuildings').update({ Level: building.Level + 1 }).eq('Id', building.Id);

        res.json({ success: true, newLevel: building.Level + 1 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error upgrading' });
    }
});

// 7. Spirit Vein Claim (AFK Rewards)
router.post('/claim-vein', async (req, res) => {
    const { userId } = req.body;
    try {
        const { data: member } = await supabase
            .from('SectMembers')
            .select('*')
            .eq('UserId', userId)
            .maybeSingle();

        if (!member) return res.status(400).json({ message: 'Not in a sect' });

        const sectId = member.SectId;

        // Get Vein Level
        const { data: vein } = await supabase
            .from('SectBuildings')
            .select('Level')
            .eq('SectId', sectId)
            .eq('Type', 'Vein')
            .maybeSingle();

        const veinLevel = vein?.Level || 1;

        // Calculate Time Diff (Minutes)
        const lastClaim = member.SalaryClaimedAt ? new Date(member.SalaryClaimedAt) : new Date(member.JoinedAt || member.CreatedAt || new Date()); // Fallback
        const now = new Date();
        const diffMs = now - lastClaim;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return res.status(400).json({ message: 'Nothing to claim yet' });

        // Formula: 1 Stone per minute * Level
        const stones = diffMins * veinLevel;
        const exp = diffMins * veinLevel * 10;

        // Update User (Add Stones/Exp) - Simplified
        // Update Contribution and SalaryClaimedAt
        await supabase
            .from('SectMembers')
            .update({
                Contribution: (member.Contribution || 0) + stones,
                SalaryClaimedAt: new Date().toISOString()
            })
            .eq('UserId', userId);

        // Trigger ClaimVein Mission
        updateMissionProgress(userId, 'ClaimVein', 1);

        res.json({ success: true, stones, exp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error claiming vein' });
    }
});

// 8. Manage Member (Kick, Promote, Demote)
router.post('/manage-member', async (req, res) => {
    const { userId, targetUserId, action } = req.body; // action: 'kick', 'promote', 'demote'
    try {
        // Verify Leader
        const { data: leader } = await supabase
            .from('SectMembers')
            .select('*')
            .eq('UserId', userId)
            .maybeSingle();

        if (!leader || leader.Role !== 'Leader') {
            return res.status(403).json({ message: 'Only Leader can manage members' });
        }

        // Get Target
        const { data: target } = await supabase
            .from('SectMembers')
            .select('*')
            .eq('UserId', targetUserId)
            .eq('SectId', leader.SectId)
            .maybeSingle();

        if (!target) return res.status(404).json({ message: 'Member not found' });

        if (action === 'kick') {
            await supabase.from('SectMembers').delete().eq('Id', target.Id);
        } else if (action === 'promote') {
            const newRole = target.Role === 'Outer' ? 'Inner' : target.Role === 'Inner' ? 'Core' : target.Role === 'Core' ? 'Elder' : 'Elder';
            await supabase.from('SectMembers').update({ Role: newRole }).eq('Id', target.Id);
        } else if (action === 'demote') {
            const newRole = target.Role === 'Elder' ? 'Core' : target.Role === 'Core' ? 'Inner' : target.Role === 'Inner' ? 'Outer' : 'Outer';
            await supabase.from('SectMembers').update({ Role: newRole }).eq('Id', target.Id);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error managing member' });
    }
});



// 9. Get Sect Shop Items
router.get('/shop', async (req, res) => {
    const { sectId } = req.query;
    try {
        // Get Global Items (SectId IS NULL) + Sect Specific Items
        const { data: shopItems, error } = await supabase
            .from('SectShopItems')
            .select('*, Items(*)')
            .or(`SectId.is.null,SectId.eq.${sectId}`);

        if (error) throw error;

        // Flatten
        const result = shopItems.map(item => ({
            ...item,
            Name: item.Items?.Name,
            Type: item.Items?.Type,
            Rarity: item.Items?.Rarity,
            Description: item.Items?.Description,
            Effect: item.Items?.Effect,
            Price: item.Items?.Price
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching shop' });
    }
});

// 10. Buy Item from Shop
router.post('/shop/buy', async (req, res) => {
    const { userId, shopItemId, quantity } = req.body;
    try {
        // Get User Member Info
        const { data: member } = await supabase
            .from('SectMembers')
            .select('*')
            .eq('UserId', userId)
            .maybeSingle();

        if (!member) return res.status(400).json({ message: 'Not in a sect' });

        // Get Shop Item
        const { data: shopItem } = await supabase
            .from('SectShopItems')
            .select('*')
            .eq('Id', shopItemId)
            .single();

        if (!shopItem) return res.status(404).json({ message: 'Item not found' });

        // Check Stock
        if (shopItem.Stock !== -1 && shopItem.Stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock' });
        }

        // Check Role Requirement
        const roles = ['Outer', 'Inner', 'Core', 'Elder', 'Leader'];
        const memberRank = roles.indexOf(member.Role);
        const reqRank = roles.indexOf(shopItem.ReqRole);
        if (memberRank < reqRank) {
            return res.status(403).json({ message: `Requires ${shopItem.ReqRole} rank` });
        }

        // Check Cost (Contribution)
        const totalCost = shopItem.CostContribution * quantity;
        if (member.Contribution < totalCost) {
            return res.status(400).json({ message: 'Not enough contribution' });
        }

        // Execute Transaction
        // 1. Deduct Contribution
        await supabase.from('SectMembers').update({ Contribution: member.Contribution - totalCost }).eq('UserId', userId);

        // 2. Deduct Stock (if not infinite)
        if (shopItem.Stock !== -1) {
            await supabase.from('SectShopItems').update({ Stock: shopItem.Stock - quantity }).eq('Id', shopItemId);
        }

        // 3. Add to Inventory
        const { data: existingInv } = await supabase
            .from('Inventory')
            .select('*')
            .eq('UserId', userId)
            .eq('ItemId', shopItem.ItemId)
            .maybeSingle();

        if (existingInv) {
            await supabase.from('Inventory').update({ Quantity: existingInv.Quantity + quantity }).eq('Id', existingInv.Id);
        } else {
            await supabase.from('Inventory').insert({ UserId: userId, ItemId: shopItem.ItemId, Quantity: quantity });
        }

        res.json({ success: true, remainingContribution: member.Contribution - totalCost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error buying item' });
    }
});

// 11. Get My Inventory
router.get('/inventory', async (req, res) => {
    const { userId } = req.query;
    try {
        const { data: inventory, error } = await supabase
            .from('Inventory')
            .select('*, Items(*)')
            .eq('UserId', userId);

        if (error) throw error;

        const result = inventory.map(inv => ({
            ...inv,
            Name: inv.Items?.Name,
            Type: inv.Items?.Type,
            Rarity: inv.Items?.Rarity,
            Description: inv.Items?.Description,
            Effect: inv.Items?.Effect
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching inventory' });
    }
});

// 12. Get Missions
router.get('/missions', async (req, res) => {
    const { userId } = req.query;
    try {
        // 1. Get all daily missions
        const { data: missions, error } = await supabase
            .from('SectMissions')
            .select('*')
            .eq('Type', 'Daily');

        if (error) throw error;

        // 2. Get User Progress for today
        const today = new Date().toISOString().split('T')[0];
        const { data: userMissions } = await supabase
            .from('UserMissions')
            .select('*')
            .eq('UserId', userId)
            .gte('LastUpdated', today + 'T00:00:00')
            .lt('LastUpdated', today + 'T23:59:59');

        // Merge Data
        const result = missions.map(m => {
            const um = userMissions?.find(u => u.MissionId === m.Id);
            return {
                ...m,
                Progress: um ? um.Progress : 0,
                IsClaimed: um ? um.IsClaimed : false
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching missions' });
    }
});

// 14. Claim Mission Reward
router.post('/missions/claim', async (req, res) => {
    const { userId, missionId } = req.body;
    try {
        // Get Mission
        const { data: mission } = await supabase.from('SectMissions').select('*').eq('Id', missionId).single();
        if (!mission) return res.status(404).json({ message: 'Mission not found' });

        // Get User Progress
        const today = new Date().toISOString().split('T')[0];
        const { data: um } = await supabase
            .from('UserMissions')
            .select('*')
            .eq('UserId', userId)
            .eq('MissionId', missionId)
            .gte('LastUpdated', today + 'T00:00:00')
            .lt('LastUpdated', today + 'T23:59:59')
            .maybeSingle();

        if (!um) return res.status(400).json({ message: 'Mission not started today' });
        if (um.IsClaimed) return res.status(400).json({ message: 'Already claimed' });
        if (um.Progress < mission.RequirementValue) return res.status(400).json({ message: 'Not completed yet' });

        // Give Rewards
        // Contribution
        const { data: member } = await supabase.from('SectMembers').select('Contribution').eq('UserId', userId).single();
        await supabase.from('SectMembers').update({ Contribution: (member.Contribution || 0) + mission.RewardContribution }).eq('UserId', userId);

        // Exp
        const { data: user } = await supabase.from('Users').select('Exp').eq('Id', userId).single();
        await supabase.from('Users').update({ Exp: (user.Exp || 0) + mission.RewardExp }).eq('Id', userId);

        // Mark Claimed
        await supabase.from('UserMissions').update({ IsClaimed: true }).eq('Id', um.Id);

        res.json({ success: true, contribution: mission.RewardContribution, exp: mission.RewardExp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error claiming reward' });
    }
});

// 15. Get Sect Skills (Scripture Pavilion)
router.get('/skills', async (req, res) => {
    const { userId } = req.query;
    try {
        const { data: skills, error } = await supabase.from('SectSkills').select('*');
        if (error) throw error;

        let userSkills = [];
        if (userId) {
            const { data: us } = await supabase.from('UserSectSkills').select('*').eq('UserId', userId);
            userSkills = us || [];
        }

        const result = skills.map(s => ({
            ...s,
            IsLearned: userSkills.some(us => us.SkillId === s.Id)
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching skills' });
    }
});

// 16. Learn Sect Skill
router.post('/skills/learn', async (req, res) => {
    const { userId, skillId } = req.body;
    try {
        // Check if already learned
        const { data: existing } = await supabase
            .from('UserSectSkills')
            .select('Id')
            .eq('UserId', userId)
            .eq('SkillId', skillId)
            .maybeSingle();

        if (existing) return res.status(400).json({ message: 'Skill already learned' });

        // Get Skill Cost & User Contribution
        const { data: skill } = await supabase.from('SectSkills').select('*').eq('Id', skillId).single();
        if (!skill) return res.status(404).json({ message: 'Skill not found' });

        const { data: member } = await supabase.from('SectMembers').select('*').eq('UserId', userId).maybeSingle();
        if (!member) return res.status(400).json({ message: 'Not a sect member' });

        if (member.Contribution < skill.CostContribution) {
            return res.status(400).json({ message: 'Not enough contribution' });
        }

        // Deduct Contribution
        await supabase.from('SectMembers').update({ Contribution: member.Contribution - skill.CostContribution }).eq('UserId', userId);

        // Learn Skill
        await supabase.from('UserSectSkills').insert({ UserId: userId, SkillId: skillId });

        res.json({ success: true, message: 'Learned skill successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error learning skill' });
    }
});

// 17. Claim Role Salary (Daily)
router.post('/salary', async (req, res) => {
    const { userId } = req.body;
    try {
        const { data: member } = await supabase
            .from('SectMembers')
            .select('*')
            .eq('UserId', userId)
            .maybeSingle();

        if (!member) return res.status(400).json({ message: 'Not a sect member' });

        // Check if already claimed today
        if (member.RoleSalaryClaimedAt) {
            const lastClaim = new Date(member.RoleSalaryClaimedAt);
            const today = new Date();
            if (lastClaim.getDate() === today.getDate() &&
                lastClaim.getMonth() === today.getMonth() &&
                lastClaim.getFullYear() === today.getFullYear()) {
                return res.status(400).json({ message: 'Already claimed today' });
            }
        }

        // Define Salary Tiers
        const SALARY_TIERS = {
            'Leader': { stones: 500, contribution: 100 },
            'Elder': { stones: 300, contribution: 50 },
            'Core': { stones: 100, contribution: 30 },
            'Inner': { stones: 50, contribution: 20 },
            'Outer': { stones: 10, contribution: 10 }
        };

        const reward = SALARY_TIERS[member.Role] || SALARY_TIERS['Outer'];

        // Give Rewards
        const { data: user } = await supabase.from('Users').select('Stones').eq('Id', userId).single();
        await supabase.from('Users').update({ Stones: (user.Stones || 0) + reward.stones }).eq('Id', userId);

        await supabase
            .from('SectMembers')
            .update({
                Contribution: (member.Contribution || 0) + reward.contribution,
                RoleSalaryClaimedAt: new Date().toISOString()
            })
            .eq('UserId', userId);

        res.json({ success: true, stones: reward.stones, contribution: reward.contribution });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error claiming salary' });
    }
});

// 18. Get Auctions
router.get('/auction', async (req, res) => {
    try {
        const { data: auctions, error } = await supabase
            .from('Auctions')
            .select('*, Items(*), Users!HighestBidderId(Username)')
            .eq('IsClosed', false)
            .gt('EndTime', new Date().toISOString());

        if (error) throw error;

        const result = auctions.map(a => ({
            ...a,
            ItemName: a.Items?.Name,
            ItemDesc: a.Items?.Description,
            HighestBidderName: a.Users?.Username
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching auctions' });
    }
});

// 19. Bid on Auction
router.post('/auction/bid', async (req, res) => {
    const { userId, auctionId, bidAmount } = req.body;
    try {
        const { data: auction } = await supabase.from('Auctions').select('*').eq('Id', auctionId).single();
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        if (auction.IsClosed || new Date(auction.EndTime) < new Date()) return res.status(400).json({ message: 'Auction closed' });
        if (bidAmount <= auction.CurrentBid) return res.status(400).json({ message: 'Bid must be higher than current bid' });

        // Check User Stones
        const { data: user } = await supabase.from('Users').select('Stones').eq('Id', userId).single();
        if (user.Stones < bidAmount) return res.status(400).json({ message: 'Not enough stones' });

        // Refund previous bidder
        if (auction.HighestBidderId) {
            const { data: prevBidder } = await supabase.from('Users').select('Stones').eq('Id', auction.HighestBidderId).single();
            await supabase.from('Users').update({ Stones: (prevBidder.Stones || 0) + auction.CurrentBid }).eq('Id', auction.HighestBidderId);
        }

        // Deduct new bidder stones
        await supabase.from('Users').update({ Stones: user.Stones - bidAmount }).eq('Id', userId);

        // Update Auction
        await supabase.from('Auctions').update({ CurrentBid: bidAmount, HighestBidderId: userId }).eq('Id', auctionId);

        res.json({ success: true, message: 'Bid placed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error placing bid' });
    }
});

// 20. Get Black Market Items
router.get('/black-market', async (req, res) => {
    try {
        const { data: items, error } = await supabase
            .from('BlackMarketItems')
            .select('*, Items(*)')
            .gt('Stock', 0);

        if (error) throw error;

        const result = items.map(bm => ({
            ...bm,
            ItemName: bm.Items?.Name,
            ItemDesc: bm.Items?.Description,
            Rarity: bm.Items?.Rarity
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching black market' });
    }
});

// 21. Buy Black Market Item
router.post('/black-market/buy', async (req, res) => {
    const { userId, bmId } = req.body;
    try {
        const { data: bmItem } = await supabase.from('BlackMarketItems').select('*').eq('Id', bmId).single();
        if (!bmItem || bmItem.Stock <= 0) return res.status(400).json({ message: 'Item out of stock' });

        // Check User Stones
        const { data: user } = await supabase.from('Users').select('Stones').eq('Id', userId).single();
        if (user.Stones < bmItem.Price) return res.status(400).json({ message: 'Not enough stones' });

        // Transaction
        await supabase.from('Users').update({ Stones: user.Stones - bmItem.Price }).eq('Id', userId);
        await supabase.from('BlackMarketItems').update({ Stock: bmItem.Stock - 1 }).eq('Id', bmId);

        // Add to Inventory
        const { data: existingInv } = await supabase
            .from('Inventory')
            .select('*')
            .eq('UserId', userId)
            .eq('ItemId', bmItem.ItemId)
            .maybeSingle();

        if (existingInv) {
            await supabase.from('Inventory').update({ Quantity: existingInv.Quantity + 1 }).eq('Id', existingInv.Id);
        } else {
            await supabase.from('Inventory').insert({ UserId: userId, ItemId: bmItem.ItemId, Quantity: 1 });
        }

        res.json({ success: true, message: 'Bought successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error buying item' });
    }
});

// 22. Get Shop Items (Generic) - Deprecated/Merged with /shop
// Keeping for compatibility if needed, but likely covered by /shop
router.get('/shop-generic', async (req, res) => {
    try {
        const { data: items } = await supabase
            .from('Items')
            .select('*')
            .in('Rarity', ['Common', 'Uncommon']);

        const shopItems = items.map(item => ({
            ...item,
            CostContribution: item.Rarity === 'Common' ? 100 : 500,
            ReqRole: item.Rarity === 'Common' ? 'Outer' : 'Inner'
        }));
        res.json(shopItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching shop' });
    }
});

// 23. Get User Inventory (Duplicate of /inventory)
// Removed to avoid confusion

// 24. Buy from Sect Shop (Duplicate of /shop/buy)
// Removed to avoid confusion

module.exports = { router, updateMissionProgress };
