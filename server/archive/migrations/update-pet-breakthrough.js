
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const spDefinition = `
IF OBJECT_ID('sp_Breakthrough', 'P') IS NOT NULL DROP PROCEDURE sp_Breakthrough;
GO
CREATE PROCEDURE sp_Breakthrough
    @PetId INT,
    @NewTier INT,
    @NewVisualUrl NVARCHAR(MAX),
    @NewStats NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Pets
    SET Tier = @NewTier,
        VisualUrl = @NewVisualUrl,
        Stats = @NewStats,
        Level = Level + 1 -- Bonus level up
    WHERE Id = @PetId;
    
    SELECT * FROM Pets WHERE Id = @PetId;
END
GO
`;

function run() {
    console.log('Updating sp_Breakthrough...');
    const parts = spDefinition.split('GO');

    let p = Promise.resolve();
    parts.forEach(part => {
        if (part.trim()) {
            p = p.then(() => new Promise((resolve, reject) => {
                sql.query(connectionString, part, (err) => {
                    if (err) console.error('Error:', err);
                    resolve();
                });
            }));
        }
    });

    p.then(() => console.log('sp_Breakthrough updated successfully.'));
}

run();
