const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const query = `
-- Favorites Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Favorites]') AND type in (N'U'))
BEGIN
    CREATE TABLE Favorites (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        MovieId INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (UserId) REFERENCES Users(Id),
        FOREIGN KEY (MovieId) REFERENCES Movies(Id)
    );
END
GO

-- WatchHistory Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[WatchHistory]') AND type in (N'U'))
BEGIN
    CREATE TABLE WatchHistory (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        MovieId INT NOT NULL,
        EpisodeId INT NULL,
        ProgressSeconds INT DEFAULT 0,
        LastWatchedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (UserId) REFERENCES Users(Id),
        FOREIGN KEY (MovieId) REFERENCES Movies(Id),
        FOREIGN KEY (EpisodeId) REFERENCES Episodes(Id)
    );
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

-- sp_UpdateWatchHistory
IF OBJECT_ID('sp_UpdateWatchHistory', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateWatchHistory;
GO
CREATE PROCEDURE sp_UpdateWatchHistory
    @UserId INT,
    @MovieId INT,
    @EpisodeId INT = NULL,
    @ProgressSeconds INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM WatchHistory WHERE UserId = @UserId AND MovieId = @MovieId)
    BEGIN
        UPDATE WatchHistory
        SET EpisodeId = @EpisodeId,
            ProgressSeconds = @ProgressSeconds,
            LastWatchedAt = GETDATE()
        WHERE UserId = @UserId AND MovieId = @MovieId;
    END
    ELSE
    BEGIN
        INSERT INTO WatchHistory (UserId, MovieId, EpisodeId, ProgressSeconds, LastWatchedAt)
        VALUES (@UserId, @MovieId, @EpisodeId, @ProgressSeconds, GETDATE());
    END
END
GO

-- sp_GetWatchHistory
IF OBJECT_ID('sp_GetWatchHistory', 'P') IS NOT NULL DROP PROCEDURE sp_GetWatchHistory;
GO
CREATE PROCEDURE sp_GetWatchHistory
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT m.*, wh.ProgressSeconds, wh.LastWatchedAt, wh.EpisodeId,
           e.EpisodeNumber, e.Title as EpisodeTitle
    FROM Movies m
    JOIN WatchHistory wh ON m.Id = wh.MovieId
    LEFT JOIN Episodes e ON wh.EpisodeId = e.Id
    WHERE wh.UserId = @UserId
    ORDER BY wh.LastWatchedAt DESC;
END
GO

-- sp_GetWatchProgress (Ensure it matches usage)
IF OBJECT_ID('sp_GetWatchProgress', 'P') IS NOT NULL DROP PROCEDURE sp_GetWatchProgress;
GO
CREATE PROCEDURE sp_GetWatchProgress
    @UserId INT,
    @MovieId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT EpisodeId, ProgressSeconds
    FROM WatchHistory
    WHERE UserId = @UserId AND MovieId = @MovieId;
END
GO

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
`;

const sps = query.split('GO');

async function run() {
    console.log('Creating Favorites and WatchHistory schema...');

    for (const sp of sps) {
        if (sp.trim()) {
            await new Promise((resolve, reject) => {
                sql.query(connectionString, sp, (err) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
    }

    console.log('Schema updated successfully.');
}

run();
