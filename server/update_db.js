const { query } = require('./db');

async function updateDb() {
    try {
        console.log('Creating sp_GetWatchProgress...');
        // Drop if exists
        await query(`
            IF OBJECT_ID('sp_GetWatchProgress', 'P') IS NOT NULL DROP PROCEDURE sp_GetWatchProgress
        `);

        // Create procedure
        // Note: msnodesqlv8 might have issues with GO, so we run it as a single batch if possible, or separate calls.
        // Usually CREATE PROCEDURE must be the first statement in a batch.
        await query(`
            CREATE PROCEDURE [dbo].[sp_GetWatchProgress]
                @UserId int,
                @MovieId int
            AS
            BEGIN
                SET NOCOUNT ON;
                SELECT ProgressSeconds FROM WatchHistory WHERE UserId = @UserId AND MovieId = @MovieId;
            END
        `);
        console.log('Successfully created sp_GetWatchProgress');
    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        process.exit();
    }
}

updateDb();
