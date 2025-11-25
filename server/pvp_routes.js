const express = require('express');
const router = express.Router();
const { supabase } = require('./supabase');

// In-memory store for active battles (Simple implementation)
// In production, use Redis or Database
const activeBattles = new Map();

// Helper: Calculate Damage
const calculateDamage = (attacker, defender, skillPower = 0) => {
    const atk = attacker.stats.atk || 10;
    const def = defender.stats.def || 10;
    const skillMult = skillPower > 0 ? (1 + skillPower / 100) : 1;

    let damage = (atk * skillMult) - (def * 0.5);
    if (damage < 1) damage = 1;

    // Crit
    const cri = attacker.stats.cri || 5;
    let isCrit = false;
    if (Math.random() * 100 < cri) {
        damage *= 1.5;
        isCrit = true;
    }

    // Variance
    const variance = 0.9 + Math.random() * 0.2;
    return { damage: Math.floor(damage * variance), isCrit };
};

// 1. Get Opponents
router.get('/opponents', async (req, res) => {
    const { userId } = req.query;
    try {
        // Get User Elo
        const { data: userPet } = await supabase
            .from('Pets')
            .select('Elo')
            .eq('UserId', userId)
            .order('Id', { ascending: false })
            .limit(1)
            .maybeSingle();

        const userElo = userPet?.Elo || 1000;

        // Fetch Opponents (Range +/- 300)
        // Supabase doesn't support random sort easily. We fetch a batch and shuffle.
        const { data: opponents, error } = await supabase
            .from('Pets')
            .select('*, Users!UserId(Username)')
            .neq('UserId', userId)
            .gte('Elo', userElo - 300)
            .lte('Elo', userElo + 300)
            .limit(20); // Fetch 20 candidates

        if (error) throw error;

        // Shuffle and pick 3
        const shuffled = opponents.sort(() => 0.5 - Math.random()).slice(0, 3);

        const result = shuffled.map(o => ({
            ...o,
            Stats: typeof o.Stats === 'string' ? JSON.parse(o.Stats || '{}') : o.Stats,
            OwnerName: o.Users?.Username
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching opponents' });
    }
});

// 2. Start Battle (Challenge)
router.post('/challenge', async (req, res) => {
    const { userId, opponentPetId } = req.body;
    try {
        // Fetch My Pet
        const { data: myPet } = await supabase
            .from('Pets')
            .select('*')
            .eq('UserId', userId)
            .order('Id', { ascending: false })
            .limit(1)
            .maybeSingle();

        // Fetch Opponent Pet
        const { data: oppPet } = await supabase
            .from('Pets')
            .select('*')
            .eq('Id', opponentPetId)
            .single();

        if (!myPet || !oppPet) return res.status(404).json({ message: 'Pet not found' });

        // Parse Data
        myPet.stats = typeof myPet.Stats === 'string' ? JSON.parse(myPet.Stats || '{}') : myPet.Stats || {};
        myPet.skills = typeof myPet.Skills === 'string' ? JSON.parse(myPet.Skills || '[]') : myPet.Skills || [];
        oppPet.stats = typeof oppPet.Stats === 'string' ? JSON.parse(oppPet.Stats || '{}') : oppPet.Stats || {};
        oppPet.skills = typeof oppPet.Skills === 'string' ? JSON.parse(oppPet.Skills || '[]') : oppPet.Skills || [];

        // Create Match ID
        const matchId = Date.now().toString() + Math.floor(Math.random() * 1000);

        // Init Battle State
        const battleState = {
            matchId,
            myPet,
            oppPet,
            myHp: myPet.stats.hp || 100,
            oppHp: oppPet.stats.hp || 100,
            turn: 1,
            log: [],
            startTime: Date.now()
        };

        activeBattles.set(matchId, battleState);

        res.json({
            matchId,
            myPet,
            oppPet,
            myHp: battleState.myHp,
            oppHp: battleState.oppHp
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Battle start error' });
    }
});

// 3. Battle Action (Turn)
router.post('/action', async (req, res) => {
    const { matchId, action, skillName } = req.body;

    const battle = activeBattles.get(matchId);
    if (!battle) return res.status(404).json({ message: 'Battle not found or expired' });

    try {
        const { myPet, oppPet } = battle;
        const roundLog = {};

        // --- PLAYER TURN ---
        let myDmg = 0;
        let myMove = action;
        let myIsCrit = false;

        if (action === 'Skill') {
            // Find skill power
            const skill = myPet.skills.find(s => s.name === skillName);
            const power = skill ? (skill.power || 50) : 0; // Default power if not defined
            const res = calculateDamage(myPet, oppPet, power);
            myDmg = res.damage;
            myIsCrit = res.isCrit;
            myMove = `used ${skillName}`;
        } else {
            const res = calculateDamage(myPet, oppPet, 0);
            myDmg = res.damage;
            myIsCrit = res.isCrit;
            myMove = 'attacked';
        }

        battle.oppHp -= myDmg;
        roundLog.player = { action: myMove, damage: myDmg, isCrit: myIsCrit };

        // Check Win
        if (battle.oppHp <= 0) {
            battle.oppHp = 0;
            await finishBattle(battle, myPet.UserId);
            return res.json({
                ...roundLog,
                myHp: battle.myHp,
                oppHp: battle.oppHp,
                isOver: true,
                winnerId: myPet.UserId,
                eloChange: 20
            });
        }

        // --- AI TURN ---
        // Simple AI: 30% chance to use random skill
        let aiDmg = 0;
        let aiMove = 'Attack';
        let aiIsCrit = false;
        let aiSkill = null;

        if (oppPet.skills.length > 0 && Math.random() < 0.3) {
            aiSkill = oppPet.skills[Math.floor(Math.random() * oppPet.skills.length)];
            aiMove = 'Skill';
        }

        if (aiMove === 'Skill') {
            const power = aiSkill.power || 50;
            const res = calculateDamage(oppPet, myPet, power);
            aiDmg = res.damage;
            aiIsCrit = res.isCrit;
            aiMove = `used ${aiSkill.name}`;
        } else {
            const res = calculateDamage(oppPet, myPet, 0);
            aiDmg = res.damage;
            aiIsCrit = res.isCrit;
            aiMove = 'attacked';
        }

        battle.myHp -= aiDmg;
        roundLog.ai = { action: aiMove, damage: aiDmg, isCrit: aiIsCrit };

        // Check Loss
        if (battle.myHp <= 0) {
            battle.myHp = 0;
            await finishBattle(battle, oppPet.UserId);
            return res.json({
                ...roundLog,
                myHp: battle.myHp,
                oppHp: battle.oppHp,
                isOver: true,
                winnerId: oppPet.UserId,
                eloChange: -20
            });
        }

        // Update State
        battle.turn++;
        battle.log.push(roundLog);

        res.json({
            ...roundLog,
            myHp: battle.myHp,
            oppHp: battle.oppHp,
            isOver: false
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Turn error' });
    }
});

// Helper: Finish Battle
async function finishBattle(battle, winnerId) {
    const { myPet, oppPet, log } = battle;
    const isWin = winnerId === myPet.UserId;

    // Elo Calculation
    const eloChange = 20;
    const newMyElo = (myPet.Elo || 1000) + (isWin ? eloChange : -eloChange);
    const newOppElo = (oppPet.Elo || 1000) + (isWin ? -eloChange : eloChange);

    // Update DB
    await supabase.from('Pets').update({
        Elo: newMyElo,
        Wins: (myPet.Wins || 0) + (isWin ? 1 : 0),
        Losses: (myPet.Losses || 0) + (isWin ? 0 : 1)
    }).eq('Id', myPet.Id);

    await supabase.from('Pets').update({
        Elo: newOppElo,
        Wins: (oppPet.Wins || 0) + (!isWin ? 1 : 0),
        Losses: (oppPet.Losses || 0) + (!isWin ? 0 : 1)
    }).eq('Id', oppPet.Id);

    // Save Match
    const logJson = JSON.stringify(log);
    await supabase.from('PvPMatches').insert({
        Player1Id: myPet.UserId,
        Player2Id: oppPet.UserId,
        WinnerId: winnerId,
        Log: logJson
    });

    // Cleanup
    activeBattles.delete(battle.matchId);
}

// 4. Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { data: leaderboard, error } = await supabase
            .from('Pets')
            .select('*, Users!UserId(Username)')
            .order('Elo', { ascending: false })
            .limit(10);

        if (error) throw error;

        const result = leaderboard.map(p => ({
            ...p,
            OwnerName: p.Users?.Username
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});

// 5. Match History
router.get('/history', async (req, res) => {
    const { userId } = req.query;
    try {
        const { data: matches, error } = await supabase
            .from('PvPMatches')
            .select(`
                Id, WinnerId, CreatedAt,
                Player1:Users!Player1Id(Username),
                Player2:Users!Player2Id(Username)
            `)
            .or(`Player1Id.eq.${userId},Player2Id.eq.${userId}`)
            .order('CreatedAt', { ascending: false })
            .limit(20);

        if (error) throw error;

        const result = matches.map(m => ({
            Id: m.Id,
            WinnerId: m.WinnerId,
            CreatedAt: m.CreatedAt,
            P1Name: m.Player1?.Username,
            P2Name: m.Player2?.Username
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching history' });
    }
});

module.exports = router;
