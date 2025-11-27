
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const seedScript = `
DECLARE @MovieId int;
DECLARE @EpisodeCount int;
DECLARE @VideoUrl nvarchar(500);
DECLARE @i int;

DECLARE movie_cursor CURSOR FOR 
SELECT Id, EpisodeCount, VideoUrl FROM Movies;

OPEN movie_cursor;

FETCH NEXT FROM movie_cursor INTO @MovieId, @EpisodeCount, @VideoUrl;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Check if episodes already exist
    IF NOT EXISTS (SELECT 1 FROM Episodes WHERE MovieId = @MovieId)
    BEGIN
        SET @i = 1;
        WHILE @i <= @EpisodeCount
        BEGIN
            INSERT INTO Episodes (MovieId, EpisodeNumber, Title, VideoUrl, Duration)
            VALUES (@MovieId, @i, N'Tập ' + CAST(@i AS NVARCHAR(10)), ISNULL(@VideoUrl, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 1200);
            
            SET @i = @i + 1;
        END
        PRINT 'Seeded episodes for Movie ID ' + CAST(@MovieId AS NVARCHAR(10));
    END
    
    FETCH NEXT FROM movie_cursor INTO @MovieId, @EpisodeCount, @VideoUrl;
END

CLOSE movie_cursor;
DEALLOCATE movie_cursor;
`;

function run() {
    console.log('Seeding episodes based on Movie EpisodeCount...');
    sql.query(connectionString, seedScript, (err) => {
        if (err) {
            console.error('Error seeding episodes:', err);
        } else {
            console.log('Episodes seeded successfully.');
        }
    });
}

run();
