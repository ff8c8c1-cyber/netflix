const { query } = require('./db');

async function debugInsertV2() {
    try {
        console.log('Fetching a valid user...');
        const userResult = await query('SELECT TOP 1 Id FROM Users');
        if (userResult.recordset.length === 0) {
            console.error('No users found!');
            return;
        }
        const userId = userResult.recordset[0].Id;
        console.log('Using UserId:', userId);

        console.log('Attempting manual INSERT...');
        const sql = `
            INSERT INTO Pets (UserId, Name, Species, Element, Rarity, Tier, Level, Exp, Bond, Mood, VisualUrl, Stats, Skills)
            VALUES (${userId}, 'TestPetManualV2', 'Phoenix', 'Fire', 'Divine', 0, 1, 0, 0, 'Happy', 'http://url', '{}', '[]');
            
            SELECT SCOPE_IDENTITY() as NewId;
        `;
        const result = await query(sql);
        console.log('Insert Result:', result);
    } catch (err) {
        console.error('Insert Error:', err);
    }
}

debugInsertV2();
