const { query } = require('./db');

async function debugInsert() {
    try {
        console.log('Attempting manual INSERT...');
        const sql = `
            INSERT INTO Pets (UserId, Name, Species, Element, Rarity, Tier, Level, Exp, Bond, Mood, VisualUrl, Stats, Skills)
            VALUES (1, 'TestPetManual', 'Phoenix', 'Fire', 'Divine', 0, 1, 0, 0, 'Happy', 'http://url', '{}', '[]');
            
            SELECT SCOPE_IDENTITY() as NewId;
        `;
        const result = await query(sql);
        console.log('Insert Result:', result);
    } catch (err) {
        console.error('Insert Error:', err);
    }
}

debugInsert();
