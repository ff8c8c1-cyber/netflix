
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const addColumnQuery = `
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Role')
BEGIN
    ALTER TABLE Users ADD Role NVARCHAR(50) DEFAULT 'user';
END
`;

const updateRoleQuery = `
UPDATE Users SET Role = 'admin' WHERE Id = 1;
`;

const spDefinitions = `
-- sp_AddMovie
IF OBJECT_ID('sp_AddMovie', 'P') IS NOT NULL DROP PROCEDURE sp_AddMovie;
GO
CREATE PROCEDURE sp_AddMovie
    @Title NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @CoverImage NVARCHAR(500),
    @Category NVARCHAR(100),
    @VideoUrl NVARCHAR(500),
    @EpisodeCount INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Movies (Title, Description, CoverImage, Category, VideoUrl, EpisodeCount, CreatedAt)
    VALUES (@Title, @Description, @CoverImage, @Category, @VideoUrl, @EpisodeCount, GETDATE());
    
    SELECT SCOPE_IDENTITY() AS Id;
END
GO

-- sp_UpdateMovie
IF OBJECT_ID('sp_UpdateMovie', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateMovie;
GO
CREATE PROCEDURE sp_UpdateMovie
    @Id INT,
    @Title NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @CoverImage NVARCHAR(500),
    @Category NVARCHAR(100),
    @VideoUrl NVARCHAR(500),
    @EpisodeCount INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Movies
    SET Title = @Title,
        Description = @Description,
        CoverImage = @CoverImage,
        Category = @Category,
        VideoUrl = @VideoUrl,
        EpisodeCount = @EpisodeCount
    WHERE Id = @Id;
END
GO

-- sp_DeleteMovie
IF OBJECT_ID('sp_DeleteMovie', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteMovie;
GO
CREATE PROCEDURE sp_DeleteMovie
    @Id INT
AS
BEGIN
    DELETE FROM Episodes WHERE MovieId = @Id;
    DELETE FROM Movies WHERE Id = @Id;
END
GO

-- sp_AddEpisode
IF OBJECT_ID('sp_AddEpisode', 'P') IS NOT NULL DROP PROCEDURE sp_AddEpisode;
GO
CREATE PROCEDURE sp_AddEpisode
    @MovieId INT,
    @EpisodeNumber INT,
    @Title NVARCHAR(255),
    @VideoUrl NVARCHAR(500),
    @Duration INT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Episodes (MovieId, EpisodeNumber, Title, VideoUrl, Duration, CreatedAt)
    VALUES (@MovieId, @EpisodeNumber, @Title, @VideoUrl, @Duration, GETDATE());
    
    -- Update EpisodeCount in Movies table
    UPDATE Movies SET EpisodeCount = (SELECT COUNT(*) FROM Episodes WHERE MovieId = @MovieId) WHERE Id = @MovieId;
    
    SELECT SCOPE_IDENTITY() AS Id;
END
GO

-- sp_UpdateEpisode
IF OBJECT_ID('sp_UpdateEpisode', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateEpisode;
GO
CREATE PROCEDURE sp_UpdateEpisode
    @Id INT,
    @Title NVARCHAR(255),
    @EpisodeNumber INT,
    @VideoUrl NVARCHAR(500),
    @Duration INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Episodes
    SET Title = @Title,
        EpisodeNumber = @EpisodeNumber,
        VideoUrl = @VideoUrl,
        Duration = @Duration
    WHERE Id = @Id;
END
GO

-- sp_DeleteEpisode
IF OBJECT_ID('sp_DeleteEpisode', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteEpisode;
GO
CREATE PROCEDURE sp_DeleteEpisode
    @Id INT
AS
BEGIN
    DECLARE @MovieId INT;
    SELECT @MovieId = MovieId FROM Episodes WHERE Id = @Id;

    DELETE FROM Episodes WHERE Id = @Id;
    
    -- Update EpisodeCount
    UPDATE Movies SET EpisodeCount = (SELECT COUNT(*) FROM Episodes WHERE MovieId = @MovieId) WHERE Id = @MovieId;
END
GO
`;

function run() {
    console.log('Updating schema for Admin Dashboard...');

    // 1. Add Column
    sql.query(connectionString, addColumnQuery, (err) => {
        if (err) {
            console.error('Error adding column:', err);
            return;
        }
        console.log('Role column check/add complete.');

        // 2. Update Role (now safe)
        sql.query(connectionString, updateRoleQuery, (e) => {
            if (e) console.error('Error updating role:', e);
            else console.log('User role updated to admin.');

            // 3. Run SPs
            const sps = spDefinitions.split('GO');
            let p = Promise.resolve();
            sps.forEach(sp => {
                if (sp.trim()) {
                    p = p.then(() => new Promise((resolve, reject) => {
                        sql.query(connectionString, sp, (errSP) => {
                            if (errSP) console.error('Error creating SP:', errSP);
                            resolve();
                        });
                    }));
                }
            });

            p.then(() => console.log('All Stored Procedures created.'));
        });
    });
}

run();
