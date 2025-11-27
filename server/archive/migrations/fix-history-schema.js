const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const sps = [
    `
    IF OBJECT_ID('sp_GetWatchHistory', 'P') IS NOT NULL DROP PROCEDURE sp_GetWatchHistory;
    `,
    `
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
    `,
    `
    IF OBJECT_ID('sp_UpdateWatchHistory', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateWatchHistory;
    `,
    `
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
    `
];

async function run() {
    console.log('Fixing WatchHistory SPs...');

    for (const sp of sps) {
        try {
            await new Promise((resolve, reject) => {
                sql.query(connectionString, sp, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            console.log('Successfully executed block.');
        } catch (err) {
            console.error('Error executing block:', err);
            console.error('Query:', sp);
        }
    }

    console.log('Done.');
}

run();
