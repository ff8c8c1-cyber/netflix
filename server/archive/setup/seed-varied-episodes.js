
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const videos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
];

const updateScript = `
DECLARE @EpisodeId int;
DECLARE @Counter int = 0;
DECLARE @VideoUrl nvarchar(500);

DECLARE episode_cursor CURSOR FOR 
SELECT Id FROM Episodes ORDER BY Id;

OPEN episode_cursor;
FETCH NEXT FROM episode_cursor INTO @EpisodeId;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Round robin selection logic in SQL is hard without an array, so we'll just update in batches or use a modulo on ID
    -- Actually, let's just use the ID modulo 10 to pick a video
    
    IF @EpisodeId % 10 = 0 SET @VideoUrl = '${videos[0]}';
    IF @EpisodeId % 10 = 1 SET @VideoUrl = '${videos[1]}';
    IF @EpisodeId % 10 = 2 SET @VideoUrl = '${videos[2]}';
    IF @EpisodeId % 10 = 3 SET @VideoUrl = '${videos[3]}';
    IF @EpisodeId % 10 = 4 SET @VideoUrl = '${videos[4]}';
    IF @EpisodeId % 10 = 5 SET @VideoUrl = '${videos[5]}';
    IF @EpisodeId % 10 = 6 SET @VideoUrl = '${videos[6]}';
    IF @EpisodeId % 10 = 7 SET @VideoUrl = '${videos[7]}';
    IF @EpisodeId % 10 = 8 SET @VideoUrl = '${videos[8]}';
    IF @EpisodeId % 10 = 9 SET @VideoUrl = '${videos[9]}';

    UPDATE Episodes SET VideoUrl = @VideoUrl WHERE Id = @EpisodeId;
    
    FETCH NEXT FROM episode_cursor INTO @EpisodeId;
END

CLOSE episode_cursor;
DEALLOCATE episode_cursor;
`;

function run() {
    console.log('Seeding varied videos...');
    sql.query(connectionString, updateScript, (err) => {
        if (err) console.error('Error:', err);
        else console.log('Episodes updated with varied videos.');
    });
}

run();
