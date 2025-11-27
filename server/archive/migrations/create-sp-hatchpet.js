const { query } = require('./db');

async function createSpHatchPet() {
    try {
        console.log('Creating sp_HatchPet...');

        const sql = `
            CREATE OR ALTER PROCEDURE sp_HatchPet
                @UserId INT,
                @Name NVARCHAR(100),
                @Species NVARCHAR(50),
                @Element NVARCHAR(50),
                @VisualUrl NVARCHAR(MAX),
                @Stats NVARCHAR(MAX),
                @Skills NVARCHAR(MAX)
            AS
            BEGIN
                -- Check if user already has a pet (optional, but good for now)
                -- IF EXISTS (SELECT 1 FROM Pets WHERE UserId = @UserId)
                -- BEGIN
                --     SELECT -1 AS Result, 'User already has a pet' AS Message
                --     RETURN
                -- END

                INSERT INTO Pets (UserId, Name, Species, Element, Tier, Level, Exp, Bond, Mood, VisualUrl, Stats, Skills)
                VALUES (@UserId, @Name, @Species, @Element, 0, 1, 0, 0, 'Happy', @VisualUrl, @Stats, @Skills);

                SELECT TOP 1 * FROM Pets WHERE Id = SCOPE_IDENTITY();
            END
        `;

        await query(sql);
        console.log('sp_HatchPet created successfully!');
    } catch (err) {
        console.error('Error creating sp_HatchPet:', err);
    }
}

createSpHatchPet();
