const { query } = require('./db');

const createLeaderboardSPs = async () => {
    try {
        console.log('🔄 Creating Leaderboard Stored Procedures...');

        // 1. SP for Level Leaderboard (Top EXP)
        await query(`
            CREATE OR ALTER PROCEDURE sp_GetLeaderboard_Level
            AS
            BEGIN
                SELECT TOP 10 
                    Id as UserId, 
                    Username, 
                    Exp, 
                    Rank,
                    'Level' as Category
                FROM Users
                ORDER BY Exp DESC
            END
        `);
        console.log('✅ sp_GetLeaderboard_Level created');

        // 2. SP for Wealth Leaderboard (Top Stones)
        await query(`
            CREATE OR ALTER PROCEDURE sp_GetLeaderboard_Wealth
            AS
            BEGIN
                SELECT TOP 10 
                    Id as UserId, 
                    Username, 
                    Stones, 
                    Rank,
                    'Wealth' as Category
                FROM Users
                ORDER BY Stones DESC
            END
        `);
        console.log('✅ sp_GetLeaderboard_Wealth created');

        // 3. SP for Mount Leaderboard (Top Mount Owners)
        // Assuming we count number of mounts or highest tier mount. 
        // For now, let's count number of 'Mount' type items in inventory.
        // If no items table yet, we might need to mock this query or join with UserItems if it exists.
        // Let's assume UserItems table exists from previous context (Inventory).
        await query(`
            CREATE OR ALTER PROCEDURE sp_GetLeaderboard_Mounts
            AS
            BEGIN
                SELECT TOP 10 
                    u.Id as UserId, 
                    u.Username, 
                    COUNT(ui.ItemId) as MountCount,
                    u.Rank,
                    'Mount' as Category
                FROM Users u
                LEFT JOIN UserItems ui ON u.Id = ui.UserId
                LEFT JOIN Items i ON ui.ItemId = i.Id
                WHERE i.Type = 'mount' OR i.Type = 'Mount'
                GROUP BY u.Id, u.Username, u.Rank
                ORDER BY MountCount DESC
            END
        `);
        console.log('✅ sp_GetLeaderboard_Mounts created');

        console.log('🎉 All Leaderboard SPs created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating SPs:', err);
        process.exit(1);
    }
};

createLeaderboardSPs();
