
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const schemaUpdates = `
-- Episodes Table
IF OBJECT_ID(N'[dbo].[Episodes]', 'U') IS NULL
CREATE TABLE [dbo].[Episodes](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [MovieId] [int] NOT NULL,
    [EpisodeNumber] [int] NOT NULL,
    [Title] [nvarchar](255) NULL,
    [VideoUrl] [nvarchar](500) NOT NULL,
    [Duration] [int] DEFAULT 0,
    [CreatedAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Episodes] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Episodes_Movies] FOREIGN KEY ([MovieId]) REFERENCES [dbo].[Movies]([Id])
);

-- Playlists Table
IF OBJECT_ID(N'[dbo].[Playlists]', 'U') IS NULL
CREATE TABLE [dbo].[Playlists](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [UserId] [int] NOT NULL,
    [Name] [nvarchar](100) NOT NULL,
    [IsPublic] [bit] DEFAULT 0,
    [CreatedAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Playlists] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Playlists_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
);

-- PlaylistMovies Table
IF OBJECT_ID(N'[dbo].[PlaylistMovies]', 'U') IS NULL
CREATE TABLE [dbo].[PlaylistMovies](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [PlaylistId] [int] NOT NULL,
    [MovieId] [int] NOT NULL,
    [AddedAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_PlaylistMovies] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_PlaylistMovies_Playlists] FOREIGN KEY ([PlaylistId]) REFERENCES [dbo].[Playlists]([Id]),
    CONSTRAINT [FK_PlaylistMovies_Movies] FOREIGN KEY ([MovieId]) REFERENCES [dbo].[Movies]([Id])
);
`;

const storedProcedures = `
-- SP Get Episodes
CREATE OR ALTER PROCEDURE [dbo].[sp_GetMovieEpisodes]
    @MovieId int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Episodes WHERE MovieId = @MovieId ORDER BY EpisodeNumber;
END;

-- SP Get Playlists
CREATE OR ALTER PROCEDURE [dbo].[sp_GetUserPlaylists]
    @UserId int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Playlists WHERE UserId = @UserId ORDER BY CreatedAt DESC;
END;

-- SP Create Playlist
CREATE OR ALTER PROCEDURE [dbo].[sp_CreatePlaylist]
    @UserId int,
    @Name nvarchar(100)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Playlists (UserId, Name) VALUES (@UserId, @Name);
    SELECT SCOPE_IDENTITY() AS PlaylistId;
END;

-- SP Add to Playlist
CREATE OR ALTER PROCEDURE [dbo].[sp_AddToPlaylist]
    @PlaylistId int,
    @MovieId int
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM PlaylistMovies WHERE PlaylistId = @PlaylistId AND MovieId = @MovieId)
    BEGIN
        INSERT INTO PlaylistMovies (PlaylistId, MovieId) VALUES (@PlaylistId, @MovieId);
    END
END;

-- SP Get Playlist Movies
CREATE OR ALTER PROCEDURE [dbo].[sp_GetPlaylistMovies]
    @PlaylistId int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT m.*, pm.AddedAt 
    FROM Movies m
    JOIN PlaylistMovies pm ON m.Id = pm.MovieId
    WHERE pm.PlaylistId = @PlaylistId
    ORDER BY pm.AddedAt DESC;
END;
`;

const seedEpisodes = `
-- Seed Episodes for existing movies if not exists
IF NOT EXISTS (SELECT 1 FROM Episodes)
BEGIN
    DECLARE @MovieId int;
    DECLARE @Count int;
    DECLARE @i int;
    
    DECLARE movie_cursor CURSOR FOR 
    SELECT Id, EpisodeCount FROM Movies WHERE EpisodeCount > 0;
    
    OPEN movie_cursor;
    FETCH NEXT FROM movie_cursor INTO @MovieId, @Count;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @i = 1;
        WHILE @i <= @Count
        BEGIN
            INSERT INTO Episodes (MovieId, EpisodeNumber, Title, VideoUrl)
            VALUES (@MovieId, @i, N'Tập ' + CAST(@i AS nvarchar(10)), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            SET @i = @i + 1;
        END
        FETCH NEXT FROM movie_cursor INTO @MovieId, @Count;
    END
    
    CLOSE movie_cursor;
    DEALLOCATE movie_cursor;
END
`;

function run() {
    console.log('Applying schema updates v2...');

    // Run schema updates
    sql.query(connectionString, schemaUpdates, (err) => {
        if (err) console.error('Schema Error:', err);
        else {
            console.log('Tables created.');

            // Run SPs
            // Need to split SPs because some drivers don't like multiple GOs or batches in one call
            // But msnodesqlv8 usually handles basic batches if no GO. 
            // I used CREATE OR ALTER which is SQL 2016+. User has SQL 2012? 
            // SQL 2012 supports CREATE PROCEDURE but not CREATE OR ALTER.
            // I should use DROP IF EXISTS then CREATE.

            // Let's rewrite SPs to be safe for SQL 2012
            const spList = [
                `IF OBJECT_ID('sp_GetMovieEpisodes', 'P') IS NOT NULL DROP PROCEDURE sp_GetMovieEpisodes`,
                `CREATE PROCEDURE [dbo].[sp_GetMovieEpisodes] @MovieId int AS BEGIN SET NOCOUNT ON; SELECT * FROM Episodes WHERE MovieId = @MovieId ORDER BY EpisodeNumber; END`,

                `IF OBJECT_ID('sp_GetUserPlaylists', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserPlaylists`,
                `CREATE PROCEDURE [dbo].[sp_GetUserPlaylists] @UserId int AS BEGIN SET NOCOUNT ON; SELECT * FROM Playlists WHERE UserId = @UserId ORDER BY CreatedAt DESC; END`,

                `IF OBJECT_ID('sp_CreatePlaylist', 'P') IS NOT NULL DROP PROCEDURE sp_CreatePlaylist`,
                `CREATE PROCEDURE [dbo].[sp_CreatePlaylist] @UserId int, @Name nvarchar(100) AS BEGIN SET NOCOUNT ON; INSERT INTO Playlists (UserId, Name) VALUES (@UserId, @Name); SELECT SCOPE_IDENTITY() AS PlaylistId; END`,

                `IF OBJECT_ID('sp_AddToPlaylist', 'P') IS NOT NULL DROP PROCEDURE sp_AddToPlaylist`,
                `CREATE PROCEDURE [dbo].[sp_AddToPlaylist] @PlaylistId int, @MovieId int AS BEGIN SET NOCOUNT ON; IF NOT EXISTS (SELECT 1 FROM PlaylistMovies WHERE PlaylistId = @PlaylistId AND MovieId = @MovieId) BEGIN INSERT INTO PlaylistMovies (PlaylistId, MovieId) VALUES (@PlaylistId, @MovieId); END END`,

                `IF OBJECT_ID('sp_GetPlaylistMovies', 'P') IS NOT NULL DROP PROCEDURE sp_GetPlaylistMovies`,
                `CREATE PROCEDURE [dbo].[sp_GetPlaylistMovies] @PlaylistId int AS BEGIN SET NOCOUNT ON; SELECT m.*, pm.AddedAt FROM Movies m JOIN PlaylistMovies pm ON m.Id = pm.MovieId WHERE pm.PlaylistId = @PlaylistId ORDER BY pm.AddedAt DESC; END`
            ];

            let p = Promise.resolve();
            spList.forEach(sp => {
                p = p.then(() => new Promise((resolve) => {
                    sql.query(connectionString, sp, (e) => {
                        if (e) console.error('SP Error:', e);
                        resolve();
                    });
                }));
            });

            p.then(() => {
                console.log('Stored Procedures updated.');
                // Seed Episodes
                sql.query(connectionString, seedEpisodes, (e) => {
                    if (e) console.error('Seed Error:', e);
                    else console.log('Episodes seeded.');
                });
            });
        }
    });
}

run();
