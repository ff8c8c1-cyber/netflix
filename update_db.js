const { execute } = require('./server/db');

async function updateDb() {
    try {
        console.log('Creating sp_GetWatchProgress...');
        await execute(`
            IF OBJECT_ID('sp_GetWatchProgress', 'P') IS NOT NULL DROP PROCEDURE sp_GetWatchProgress
        `);
        await execute(`
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
