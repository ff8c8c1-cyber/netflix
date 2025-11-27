USE TienGioiDB;
GO

-- Add Movie
IF OBJECT_ID('sp_AddMovie', 'P') IS NOT NULL DROP PROCEDURE sp_AddMovie
GO
CREATE PROCEDURE [dbo].[sp_AddMovie]
    @Title nvarchar(255),
    @Description nvarchar(max),
    @CoverImage nvarchar(500),
    @VideoUrl nvarchar(500),
    @Category nvarchar(50),
    @EpisodeCount int = 0
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Movies (Title, Description, CoverImage, VideoUrl, Category, EpisodeCount, Rating, Views)
    VALUES (@Title, @Description, @CoverImage, @VideoUrl, @Category, @EpisodeCount, 0, 0);
    SELECT SCOPE_IDENTITY() AS Id;
END
GO

-- Update Movie
IF OBJECT_ID('sp_UpdateMovie', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateMovie
GO
CREATE PROCEDURE [dbo].[sp_UpdateMovie]
    @Id int,
    @Title nvarchar(255),
    @Description nvarchar(max),
    @CoverImage nvarchar(500),
    @VideoUrl nvarchar(500),
    @Category nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Movies 
    SET Title = @Title, 
        Description = @Description, 
        CoverImage = @CoverImage, 
        VideoUrl = @VideoUrl,
        Category = @Category
    WHERE Id = @Id;
    SELECT * FROM Movies WHERE Id = @Id;
END
GO

-- Delete Movie
IF OBJECT_ID('sp_DeleteMovie', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteMovie
GO
CREATE PROCEDURE [dbo].[sp_DeleteMovie]
    @Id int
AS
BEGIN
    SET NOCOUNT ON;
    -- Delete related data first
    DELETE FROM WatchHistory WHERE MovieId = @Id;
    DELETE FROM Reviews WHERE MovieId = @Id;
    DELETE FROM Comments WHERE MovieId = @Id;
    
    DELETE FROM Movies WHERE Id = @Id;
    SELECT @@ROWCOUNT AS DeletedCount;
END
GO
