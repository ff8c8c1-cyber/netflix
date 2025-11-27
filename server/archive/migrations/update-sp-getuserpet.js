const { execute, query } = require('./db');

async function updateGetUserPet() {
    try {
        console.log('Updating sp_GetUserPet...');

        const sql = `
            CREATE OR ALTER PROCEDURE sp_GetUserPet
                @UserId INT
            AS
            BEGIN
                SELECT TOP 1 
                    Id, 
                    UserId, 
                    Name, 
                    Species, 
                    Element, 
                    Tier, 
                    Level, 
                    Exp, 
                    Bond, 
                    Mood, 
                    Stats, 
                    VisualUrl,
                    Skills -- Added Skills column
                FROM Pets
                WHERE UserId = @UserId
            END
        `;

        await query(sql);
        console.log('sp_GetUserPet updated successfully!');
    } catch (err) {
        console.error('Error updating sp_GetUserPet:', err);
    }
}

updateGetUserPet();
