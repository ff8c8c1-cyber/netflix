const { query } = require('./db');

async function updateSchema() {
    try {
        console.log('Updating WatchHistory schema...');

        // 1. Add EpisodeId column if not exists
        await query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('WatchHistory') AND name = 'EpisodeId')
            BEGIN
                ALTER TABLE WatchHistory ADD EpisodeId INT NULL;
                PRINT 'Added EpisodeId column to WatchHistory';
            END
        `);

        // 2. Add LastWatched column if not exists
        await query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('WatchHistory') AND name = 'LastWatched')
            BEGIN
                ALTER TABLE WatchHistory ADD LastWatched DATETIME DEFAULT GETDATE();
                PRINT 'Added LastWatched column to WatchHistory';
            END
        `);

        // 3. Update sp_UpdateWatchProgress
        await query(`
            CREATE OR ALTER PROCEDURE sp_UpdateWatchProgress
                @UserId INT,
                @MovieId INT,
                @ProgressSeconds INT,
                @EpisodeId INT = NULL
            AS
            BEGIN
                IF EXISTS (SELECT 1 FROM WatchHistory WHERE UserId = @UserId AND MovieId = @MovieId)
                BEGIN
                    UPDATE WatchHistory
                    SET ProgressSeconds = @ProgressSeconds,
                        EpisodeId = @EpisodeId,
                        LastWatched = GETDATE()
                    WHERE UserId = @UserId AND MovieId = @MovieId;
                END
                ELSE
                BEGIN
                    INSERT INTO WatchHistory (UserId, MovieId, ProgressSeconds, EpisodeId, LastWatched)
                    VALUES (@UserId, @MovieId, @ProgressSeconds, @EpisodeId, GETDATE());
                END
            END
        `);
        console.log('Updated sp_UpdateWatchProgress');

        // 4. Update sp_GetWatchProgress
        await query(`
            CREATE OR ALTER PROCEDURE sp_GetWatchProgress
                @UserId INT,
                @MovieId INT
            AS
            BEGIN
                SELECT ProgressSeconds, EpisodeId
                FROM WatchHistory
                WHERE UserId = @UserId AND MovieId = @MovieId;
            END
        `);
        console.log('Updated sp_GetWatchProgress');

        console.log('Schema update complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
