
const { query } = require('./db');

async function createHomeSPs() {
    try {
        console.log('Creating Home Page Stored Procedures...');

        // 1. Trending Movies
        try {
            await query("IF OBJECT_ID('sp_GetTrendingMovies', 'P') IS NOT NULL DROP PROCEDURE sp_GetTrendingMovies");
            await query(`
                CREATE PROCEDURE sp_GetTrendingMovies
                AS
                BEGIN
                    SET NOCOUNT ON;
                    SELECT TOP 10 * FROM Movies ORDER BY Views DESC;
                END
            `);
            console.log('✅ sp_GetTrendingMovies created');
        } catch (e) { console.error('Error creating sp_GetTrendingMovies', e); }

        // 2. New Releases
        try {
            await query("IF OBJECT_ID('sp_GetNewReleases', 'P') IS NOT NULL DROP PROCEDURE sp_GetNewReleases");
            await query(`
                CREATE PROCEDURE sp_GetNewReleases
                AS
                BEGIN
                    SET NOCOUNT ON;
                    SELECT TOP 10 * FROM Movies ORDER BY CreatedAt DESC;
                END
            `);
            console.log('✅ sp_GetNewReleases created');
        } catch (e) { console.error('Error creating sp_GetNewReleases', e); }

        // 3. Top Rated
        try {
            await query("IF OBJECT_ID('sp_GetTopRatedMovies', 'P') IS NOT NULL DROP PROCEDURE sp_GetTopRatedMovies");
            await query(`
                CREATE PROCEDURE sp_GetTopRatedMovies
                AS
                BEGIN
                    SET NOCOUNT ON;
                    SELECT TOP 10 * FROM Movies ORDER BY Rating DESC;
                END
            `);
            console.log('✅ sp_GetTopRatedMovies created');
        } catch (e) { console.error('Error creating sp_GetTopRatedMovies', e); }

        // 4. User Home Stats
        try {
            await query("IF OBJECT_ID('sp_GetUserHomeStats', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserHomeStats");
            await query(`
                CREATE PROCEDURE sp_GetUserHomeStats
                    @UserId int
                AS
                BEGIN
                    SET NOCOUNT ON;
                    
                    DECLARE @MoviesWatched int;
                    DECLARE @FavoriteCategory nvarchar(50);
                    DECLARE @TotalWatchSeconds int;

                    -- Count Movies Watched
                    SELECT @MoviesWatched = COUNT(DISTINCT MovieId) 
                    FROM WatchHistory 
                    WHERE UserId = @UserId;

                    -- Get Favorite Category
                    SELECT TOP 1 @FavoriteCategory = m.Category
                    FROM WatchHistory wh
                    JOIN Movies m ON wh.MovieId = m.Id
                    WHERE wh.UserId = @UserId
                    GROUP BY m.Category
                    ORDER BY COUNT(*) DESC;

                    -- Calculate Total Watch Time
                    SELECT @TotalWatchSeconds = SUM(ProgressSeconds)
                    FROM WatchHistory
                    WHERE UserId = @UserId;

                    SELECT 
                        ISNULL(@MoviesWatched, 0) as MoviesWatched,
                        ISNULL(@FavoriteCategory, 'Chưa có') as FavoriteCategory,
                        ISNULL(@TotalWatchSeconds, 0) as TotalWatchSeconds;
                END
            `);
            console.log('✅ sp_GetUserHomeStats created');
        } catch (e) { console.error('Error creating sp_GetUserHomeStats', e); }

        // 5. Get Categories
        try {
            await query("IF OBJECT_ID('sp_GetCategories', 'P') IS NOT NULL DROP PROCEDURE sp_GetCategories");
            await query(`
                CREATE PROCEDURE sp_GetCategories
                AS
                BEGIN
                    SET NOCOUNT ON;
                    SELECT DISTINCT Category as id, Category as title FROM Movies WHERE Category IS NOT NULL;
                END
            `);
            console.log('✅ sp_GetCategories created');
        } catch (e) { console.error('Error creating sp_GetCategories', e); }

    } catch (err) {
        console.error('❌ Error creating SPs:', err);
    }
}

createHomeSPs();
