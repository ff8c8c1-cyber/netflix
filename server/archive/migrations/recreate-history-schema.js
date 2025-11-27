const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const script = `
-- Drop SPs first
IF OBJECT_ID('sp_UpdateWatchHistory', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateWatchHistory;
IF OBJECT_ID('sp_GetWatchHistory', 'P') IS NOT NULL DROP PROCEDURE sp_GetWatchHistory;
IF OBJECT_ID('sp_GetWatchProgress', 'P') IS NOT NULL DROP PROCEDURE sp_GetWatchProgress;

-- Drop Table
IF OBJECT_ID('WatchHistory', 'U') IS NOT NULL DROP TABLE WatchHistory;

-- Create Table
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

-- Create SPs
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
`;

async function run() {
    console.log('Recreating WatchHistory Schema...');

    // Split by GO and execute
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
