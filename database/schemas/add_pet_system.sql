USE TienGioiDB;
GO

-- Pets Table
IF OBJECT_ID(N'[dbo].[Pets]', 'U') IS NULL
CREATE TABLE [dbo].[Pets](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [UserId] [int] NOT NULL,
    [Name] [nvarchar](100) NOT NULL,
    [Species] [nvarchar](50) NOT NULL, -- Dragon, Tiger, etc.
    [Element] [nvarchar](20) NOT NULL, -- Fire, Water, etc.
    [Rarity] [nvarchar](10) NOT NULL, -- N, R, SR, SSR, UR, LR
    [Tier] [int] DEFAULT 0, -- 0: Egg, 1: Infant...
    [Level] [int] DEFAULT 1,
    [Exp] [int] DEFAULT 0,
    [Bond] [int] DEFAULT 0,
    [Mood] [nvarchar](20) DEFAULT 'Normal',
    [Stats] [nvarchar](max) NULL, -- JSON string for stats
    [VisualUrl] [nvarchar](500) NULL,
    [CreatedAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Pets] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Pets_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
)
GO

-- Stored Procedure: Hatch Pet
IF OBJECT_ID('sp_HatchPet', 'P') IS NOT NULL DROP PROCEDURE sp_HatchPet
GO
CREATE PROCEDURE [dbo].[sp_HatchPet]
    @UserId int,
    @Name nvarchar(100),
    @Species nvarchar(50),
    @Element nvarchar(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Simple Rarity Logic (can be expanded)
    DECLARE @Rarity nvarchar(10) = 'N';
    DECLARE @Rand float = RAND();
    
    IF @Rand < 0.01 SET @Rarity = 'LR';
    ELSE IF @Rand < 0.05 SET @Rarity = 'UR';
    ELSE IF @Rand < 0.15 SET @Rarity = 'SSR';
    ELSE IF @Rand < 0.35 SET @Rarity = 'SR';
    ELSE IF @Rand < 0.65 SET @Rarity = 'R';
    
    -- Initial Stats based on Rarity (Mock values)
    DECLARE @BaseAtk int = 10;
    IF @Rarity = 'SSR' SET @BaseAtk = 50;
    IF @Rarity = 'UR' SET @BaseAtk = 80;
    IF @Rarity = 'LR' SET @BaseAtk = 120;

    DECLARE @Stats nvarchar(max) = '{"atk":' + CAST(@BaseAtk as nvarchar) + ', "def":10, "hp":100, "spd":10, "cri":5}';
    
    -- Initial Visual (Egg)
    DECLARE @VisualUrl nvarchar(500) = 'https://image.pollinations.ai/prompt/mystical%20' + @Element + '%20egg%20' + @Species + '%20glowing%20magical%20energy?width=800&height=800&nologo=true';

    INSERT INTO Pets (UserId, Name, Species, Element, Rarity, Tier, Level, Exp, Bond, Mood, Stats, VisualUrl)
    VALUES (@UserId, @Name, @Species, @Element, @Rarity, 0, 1, 0, 0, 'Happy', @Stats, @VisualUrl);
    
    SELECT * FROM Pets WHERE Id = SCOPE_IDENTITY();
END
GO

-- Stored Procedure: Get User Pet
IF OBJECT_ID('sp_GetUserPet', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserPet
GO
CREATE PROCEDURE [dbo].[sp_GetUserPet]
    @UserId int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 1 * FROM Pets WHERE UserId = @UserId ORDER BY Id DESC; -- Get latest active pet
END
GO

-- Stored Procedure: Feed Pet
IF OBJECT_ID('sp_FeedPet', 'P') IS NOT NULL DROP PROCEDURE sp_FeedPet
GO
CREATE PROCEDURE [dbo].[sp_FeedPet]
    @PetId int,
    @ExpAmount int,
    @BondAmount int
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Pets 
    SET Exp = Exp + @ExpAmount, 
        Bond = Bond + @BondAmount,
        Mood = 'Happy'
    WHERE Id = @PetId;
    
    -- Level Up Logic (Simple: Every 100 EXP)
    -- In a real app, this would be more complex or handled in app logic
    UPDATE Pets
    SET Level = Level + (Exp / 100),
        Exp = Exp % 100
    WHERE Id = @PetId AND Exp >= 100;

    SELECT * FROM Pets WHERE Id = @PetId;
END
GO

-- Stored Procedure: Breakthrough (Tier Up)
IF OBJECT_ID('sp_Breakthrough', 'P') IS NOT NULL DROP PROCEDURE sp_Breakthrough
GO
CREATE PROCEDURE [dbo].[sp_Breakthrough]
    @PetId int,
    @NewTier int,
    @NewVisualUrl nvarchar(500)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Pets 
    SET Tier = @NewTier,
        VisualUrl = @NewVisualUrl
    WHERE Id = @PetId;
    
    SELECT * FROM Pets WHERE Id = @PetId;
END
GO
