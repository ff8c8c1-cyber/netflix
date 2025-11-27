const { query } = require('./db');

async function updateSpHatchPet() {
    try {
        console.log('Updating sp_HatchPet to include Rarity...');

        const sql = `
            CREATE OR ALTER PROCEDURE sp_HatchPet
                @UserId INT,
                @Name NVARCHAR(100),
                @Species NVARCHAR(50),
                @Element NVARCHAR(50),
                @Rarity NVARCHAR(50),
                @VisualUrl NVARCHAR(MAX),
                @Stats NVARCHAR(MAX),
                @Skills NVARCHAR(MAX)
            AS
            BEGIN
                INSERT INTO Pets (UserId, Name, Species, Element, Rarity, Tier, Level, Exp, Bond, Mood, VisualUrl, Stats, Skills)
                VALUES (@UserId, @Name, @Species, @Element, @Rarity, 0, 1, 0, 0, 'Happy', @VisualUrl, @Stats, @Skills);

                SELECT TOP 1 * FROM Pets WHERE Id = SCOPE_IDENTITY();
            END
        `;

        await query(sql);
        console.log('sp_HatchPet updated successfully!');
    } catch (err) {
        console.error('Error updating sp_HatchPet:', err);
    }
}

updateSpHatchPet();
