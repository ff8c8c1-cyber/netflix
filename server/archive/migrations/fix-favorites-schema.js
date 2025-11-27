const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const script = `
-- sp_CheckFavorite
IF OBJECT_ID('sp_CheckFavorite', 'P') IS NOT NULL DROP PROCEDURE sp_CheckFavorite;
GO
CREATE PROCEDURE sp_CheckFavorite
    @UserId INT,
    @MovieId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CASE WHEN EXISTS (SELECT 1 FROM Favorites WHERE UserId = @UserId AND MovieId = @MovieId) THEN 1 ELSE 0 END AS IsFavorite;
END
GO

-- sp_AddToFavorites
IF OBJECT_ID('sp_AddToFavorites', 'P') IS NOT NULL DROP PROCEDURE sp_AddToFavorites;
GO
CREATE PROCEDURE sp_AddToFavorites
    @UserId INT,
    @MovieId INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Favorites WHERE UserId = @UserId AND MovieId = @MovieId)
    BEGIN
        INSERT INTO Favorites (UserId, MovieId) VALUES (@UserId, @MovieId);
    END
END
GO

-- sp_RemoveFromFavorites
IF OBJECT_ID('sp_RemoveFromFavorites', 'P') IS NOT NULL DROP PROCEDURE sp_RemoveFromFavorites;
GO
CREATE PROCEDURE sp_RemoveFromFavorites
    @UserId INT,
    @MovieId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Favorites WHERE UserId = @UserId AND MovieId = @MovieId;
END
GO

-- sp_GetUserFavorites
IF OBJECT_ID('sp_GetUserFavorites', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserFavorites;
GO
CREATE PROCEDURE sp_GetUserFavorites
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT m.*, f.CreatedAt as FavoritedAt
    FROM Movies m
    JOIN Favorites f ON m.Id = f.MovieId
    WHERE f.UserId = @UserId
    ORDER BY f.CreatedAt DESC;
END
GO
`;

async function run() {
    console.log('Fixing Favorites Schema...');

    const batches = script.split('GO');

    for (const batch of batches) {
        if (batch.trim()) {
            try {
                await new Promise((resolve, reject) => {
                    sql.query(connectionString, batch, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
                console.log('Executed batch successfully.');
            } catch (err) {
                console.error('Error executing batch:', err);
                console.error('Batch:', batch);
            }
        }
    }
    console.log('Done.');
}

run();
