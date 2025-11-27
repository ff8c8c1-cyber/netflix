
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const schemaUpdate = `
-- 1. Add Skills column to Pets if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Pets]') AND name = 'Skills')
BEGIN
    ALTER TABLE Pets ADD Skills NVARCHAR(MAX) DEFAULT '[]';
END

-- 2. Update sp_Breakthrough to handle Skills
IF OBJECT_ID('sp_Breakthrough', 'P') IS NOT NULL DROP PROCEDURE sp_Breakthrough;
GO
CREATE PROCEDURE sp_Breakthrough
    @PetId INT,
    @NewTier INT,
    @NewVisualUrl NVARCHAR(MAX),
    @NewStats NVARCHAR(MAX),
    @NewSkills NVARCHAR(MAX) = NULL -- Optional, defaults to NULL (no change)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Pets 
    SET Tier = @NewTier, 
        VisualUrl = @NewVisualUrl,
        Stats = @NewStats,
        Skills = ISNULL(@NewSkills, Skills) -- Update skills if provided
    WHERE Id = @PetId;
    
    SELECT * FROM Pets WHERE Id = @PetId;
END
GO
`;

function run() {
    console.log('Updating schema for Pet Skills...');

    const parts = schemaUpdate.split('GO');

    // Helper to run query promise
    const runQuery = (query) => new Promise((resolve, reject) => {
        if (!query.trim()) return resolve();
        sql.query(connectionString, query, (err) => {
            if (err) {
                console.error('Error executing query:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });

    // Execute sequentially
    runQuery(parts[0])
        .then(() => {
            console.log('Column check complete.');
            return runQuery(parts[1]);
        })
        .then(() => {
            console.log('sp_Breakthrough updated.');
            console.log('Pet Skills Schema Updated Successfully.');
        })
        .catch(err => console.error('Schema update failed:', err));
}

run();
