USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TienGioiDB')
BEGIN
    CREATE DATABASE TienGioiDB;
END
GO

USE TienGioiDB;
GO

-- Users Table
IF OBJECT_ID(N'[dbo].[Users]', 'U') IS NULL
CREATE TABLE [dbo].[Users](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [Username] [nvarchar](50) NOT NULL,
    [PasswordHash] [nvarchar](255) NOT NULL,
    [Email] [nvarchar](100) NULL,
    [AvatarUrl] [nvarchar](500) NULL,
    [Rank] [int] DEFAULT 0,
    [Exp] [int] DEFAULT 0,
    [Stones] [int] DEFAULT 0,
    [SectId] [int] DEFAULT 1,
    [CreatedAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UQ_Users_Username] UNIQUE ([Username])
)
GO

-- Movies Table
IF OBJECT_ID(N'[dbo].[Movies]', 'U') IS NULL
CREATE TABLE [dbo].[Movies](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [Title] [nvarchar](255) NOT NULL,
    [Description] [nvarchar](max) NULL,
    [CoverImage] [nvarchar](500) NULL,
    [VideoUrl] [nvarchar](500) NULL,
    [EpisodeCount] [int] DEFAULT 0,
    [Rating] [decimal](3, 1) DEFAULT 0,
    [Views] [bigint] DEFAULT 0,
    [Category] [nvarchar](50) NULL,
    [CreatedAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Movies] PRIMARY KEY CLUSTERED ([Id] ASC)
)
GO

-- Reviews Table
IF OBJECT_ID(N'[dbo].[Reviews]', 'U') IS NULL
CREATE TABLE [dbo].[Reviews](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [UserId] [int] NOT NULL,
    [MovieId] [int] NOT NULL,
    [Rating] [int] NOT NULL,
    [Comment] [nvarchar](max) NULL,
    [CreatedAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Reviews] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Reviews_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]),
    CONSTRAINT [FK_Reviews_Movies] FOREIGN KEY ([MovieId]) REFERENCES [dbo].[Movies]([Id])
)
GO

-- Comments Table
IF OBJECT_ID(N'[dbo].[Comments]', 'U') IS NULL
CREATE TABLE [dbo].[Comments](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [UserId] [int] NOT NULL,
    [MovieId] [int] NOT NULL,
    [ParentCommentId] [int] NULL,
    [Content] [nvarchar](max) NOT NULL,
    [Likes] [int] DEFAULT 0,
    [CreatedAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Comments] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Comments_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]),
    CONSTRAINT [FK_Comments_Movies] FOREIGN KEY ([MovieId]) REFERENCES [dbo].[Movies]([Id]),
    CONSTRAINT [FK_Comments_Parent] FOREIGN KEY ([ParentCommentId]) REFERENCES [dbo].[Comments]([Id])
)
GO

-- WatchHistory Table
IF OBJECT_ID(N'[dbo].[WatchHistory]', 'U') IS NULL
CREATE TABLE [dbo].[WatchHistory](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [UserId] [int] NOT NULL,
    [MovieId] [int] NOT NULL,
    [WatchedAt] [datetime] DEFAULT GETDATE(),
    [ProgressSeconds] [int] DEFAULT 0,
    CONSTRAINT [PK_WatchHistory] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_WatchHistory_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]),
    CONSTRAINT [FK_WatchHistory_Movies] FOREIGN KEY ([MovieId]) REFERENCES [dbo].[Movies]([Id])
)
GO

-- Notifications Table
IF OBJECT_ID(N'[dbo].[Notifications]', 'U') IS NULL
CREATE TABLE [dbo].[Notifications](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [UserId] [int] NOT NULL,
    [Title] [nvarchar](255) NOT NULL,
    [Content] [nvarchar](max) NULL,
    [Type] [nvarchar](50) NULL,
    [IsRead] [bit] DEFAULT 0,
    [CreatedAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Notifications] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Notifications_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
)
GO

-- STORED PROCEDURES

IF OBJECT_ID('sp_RegisterUser', 'P') IS NOT NULL DROP PROCEDURE sp_RegisterUser
GO
CREATE PROCEDURE [dbo].[sp_RegisterUser]
    @Username nvarchar(50),
    @PasswordHash nvarchar(255),
    @Email nvarchar(100)
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username)
    BEGIN
        SELECT -1 AS Result, 'Username already exists' AS Message;
        RETURN;
    END
    INSERT INTO Users (Username, PasswordHash, Email, AvatarUrl, Rank, Exp, Stones, SectId)
    VALUES (@Username, @PasswordHash, @Email, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + @Username, 0, 0, 100, 1);
    SELECT 1 AS Result, 'User registered successfully' AS Message, SCOPE_IDENTITY() AS UserId;
END
GO

IF OBJECT_ID('sp_LoginUser', 'P') IS NOT NULL DROP PROCEDURE sp_LoginUser
GO
CREATE PROCEDURE [dbo].[sp_LoginUser]
    @Username nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Username, PasswordHash, AvatarUrl, Rank, Exp, Stones, SectId FROM Users WHERE Username = @Username;
END
GO

IF OBJECT_ID('sp_GetAllMovies', 'P') IS NOT NULL DROP PROCEDURE sp_GetAllMovies
GO
CREATE PROCEDURE [dbo].[sp_GetAllMovies]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Movies ORDER BY Rating DESC;
END
GO

IF OBJECT_ID('sp_GetMovieById', 'P') IS NOT NULL DROP PROCEDURE sp_GetMovieById
GO
CREATE PROCEDURE [dbo].[sp_GetMovieById]
    @Id int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Movies WHERE Id = @Id;
END
GO

IF OBJECT_ID('sp_AddReview', 'P') IS NOT NULL DROP PROCEDURE sp_AddReview
GO
CREATE PROCEDURE [dbo].[sp_AddReview]
    @UserId int,
    @MovieId int,
    @Rating int,
    @Comment nvarchar(max)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Reviews (UserId, MovieId, Rating, Comment)
    VALUES (@UserId, @MovieId, @Rating, @Comment);
    SELECT SCOPE_IDENTITY() AS ReviewId;
END
GO

IF OBJECT_ID('sp_GetMovieComments', 'P') IS NOT NULL DROP PROCEDURE sp_GetMovieComments
GO
CREATE PROCEDURE [dbo].[sp_GetMovieComments]
    @MovieId int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.*, u.Username, u.AvatarUrl, u.Rank 
    FROM Comments c
    JOIN Users u ON c.UserId = u.Id
    WHERE c.MovieId = @MovieId AND c.ParentCommentId IS NULL
    ORDER BY c.CreatedAt DESC;
END
GO

IF OBJECT_ID('sp_AddComment', 'P') IS NOT NULL DROP PROCEDURE sp_AddComment
GO
CREATE PROCEDURE [dbo].[sp_AddComment]
    @UserId int,
    @MovieId int,
    @Content nvarchar(max),
    @ParentCommentId int = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Comments (UserId, MovieId, Content, ParentCommentId)
    VALUES (@UserId, @MovieId, @Content, @ParentCommentId);
    SELECT SCOPE_IDENTITY() AS CommentId;
END
GO

IF OBJECT_ID('sp_LikeComment', 'P') IS NOT NULL DROP PROCEDURE sp_LikeComment
GO
CREATE PROCEDURE [dbo].[sp_LikeComment]
    @CommentId int,
    @UserId int
AS
BEGIN
    SET NOCOUNT ON;
    -- Trong phiên bản đơn giản này, chúng ta chỉ tăng số like. 
    -- Để tránh spam like, cần bảng CommentLikes riêng, nhưng tạm thời làm đơn giản.
    UPDATE Comments SET Likes = Likes + 1 WHERE Id = @CommentId;
    SELECT Likes FROM Comments WHERE Id = @CommentId;
END
GO

IF OBJECT_ID('sp_DeleteComment', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteComment
GO
CREATE PROCEDURE [dbo].[sp_DeleteComment]
    @CommentId int,
    @UserId int
AS
BEGIN
    SET NOCOUNT ON;
    -- Chỉ cho phép xóa nếu là chủ sở hữu
    DELETE FROM Comments WHERE Id = @CommentId AND UserId = @UserId;
    SELECT @@ROWCOUNT AS DeletedCount;
END
GO

IF OBJECT_ID('sp_UpdateWatchProgress', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateWatchProgress
GO
CREATE PROCEDURE [dbo].[sp_UpdateWatchProgress]
    @UserId int,
    @MovieId int,
    @ProgressSeconds int
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM WatchHistory WHERE UserId = @UserId AND MovieId = @MovieId)
    BEGIN
        UPDATE WatchHistory SET ProgressSeconds = @ProgressSeconds, WatchedAt = GETDATE() WHERE UserId = @UserId AND MovieId = @MovieId;
    END
    ELSE
    BEGIN
        INSERT INTO WatchHistory (UserId, MovieId, ProgressSeconds) VALUES (@UserId, @MovieId, @ProgressSeconds);
    END
END
GO

IF OBJECT_ID('sp_GetUserNotifications', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserNotifications
GO
CREATE PROCEDURE [dbo].[sp_GetUserNotifications]
    @UserId int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Notifications WHERE UserId = @UserId ORDER BY CreatedAt DESC;
END
GO

IF OBJECT_ID('sp_SearchMovies', 'P') IS NOT NULL DROP PROCEDURE sp_SearchMovies
GO
CREATE PROCEDURE [dbo].[sp_SearchMovies]
    @Query nvarchar(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Movies WHERE Title LIKE '%' + @Query + '%' OR Description LIKE '%' + @Query + '%';
END
GO

IF OBJECT_ID('sp_UpdateMovieViews', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateMovieViews
GO
CREATE PROCEDURE [dbo].[sp_UpdateMovieViews]
    @MovieId int
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Movies SET Views = Views + 1 WHERE Id = @MovieId;
END
GO

-- Seed Data
IF NOT EXISTS (SELECT 1 FROM Movies)
BEGIN
    INSERT INTO Movies (Title, Description, CoverImage, VideoUrl, EpisodeCount, Rating, Views, Category)
    VALUES 
    (N'Phàm Nhân Tu Tiên', N'Hàn Lập...', N'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', N'url', 72, 9.8, 1250000, N'huyền huyễn'),
    (N'Đấu Phá Thương Khung', N'Xiao Yan...', N'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400', N'url', 52, 9.5, 980000, N'hành động');
END

-- Items Table
IF OBJECT_ID(N'[dbo].[Items]', 'U') IS NULL
CREATE TABLE [dbo].[Items](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](100) NOT NULL,
    [Price] [int] NOT NULL,
    [Description] [nvarchar](255) NULL,
    [Icon] [nvarchar](50) NULL,
    [Type] [nvarchar](50) NOT NULL, -- consumable, equipment, special
    [CreatedAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Items] PRIMARY KEY CLUSTERED ([Id] ASC)
)
GO

-- UserItems Table (Inventory)
IF OBJECT_ID(N'[dbo].[UserItems]', 'U') IS NULL
CREATE TABLE [dbo].[UserItems](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [UserId] [int] NOT NULL,
    [ItemId] [int] NOT NULL,
    [Quantity] [int] DEFAULT 1,
    [AcquiredAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_UserItems] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_UserItems_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]),
    CONSTRAINT [FK_UserItems_Items] FOREIGN KEY ([ItemId]) REFERENCES [dbo].[Items]([Id])
)
GO

-- Transactions Table
IF OBJECT_ID(N'[dbo].[Transactions]', 'U') IS NULL
CREATE TABLE [dbo].[Transactions](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [UserId] [int] NOT NULL,
    [ItemId] [int] NOT NULL,
    [Price] [int] NOT NULL,
    [TransactionDate] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Transactions] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Transactions_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]),
    CONSTRAINT [FK_Transactions_Items] FOREIGN KEY ([ItemId]) REFERENCES [dbo].[Items]([Id])
)
GO

-- STORED PROCEDURES FOR MARKET

IF OBJECT_ID('sp_GetItems', 'P') IS NOT NULL DROP PROCEDURE sp_GetItems
GO
CREATE PROCEDURE [dbo].[sp_GetItems]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Items;
END
GO

IF OBJECT_ID('sp_GetUserInventory', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserInventory
GO
CREATE PROCEDURE [dbo].[sp_GetUserInventory]
    @UserId int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ui.Id, ui.ItemId, ui.Quantity, i.Name, i.Description, i.Icon, i.Type
    FROM UserItems ui
    JOIN Items i ON ui.ItemId = i.Id
    WHERE ui.UserId = @UserId;
END
GO

IF OBJECT_ID('sp_BuyItem', 'P') IS NOT NULL DROP PROCEDURE sp_BuyItem
GO
CREATE PROCEDURE [dbo].[sp_BuyItem]
    @UserId int,
    @ItemId int
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Price int;
    DECLARE @UserStones int;

    -- Get Item Price
    SELECT @Price = Price FROM Items WHERE Id = @ItemId;
    
    -- Get User Stones
    SELECT @UserStones = Stones FROM Users WHERE Id = @UserId;

    IF @Price IS NULL
    BEGIN
        SELECT -1 AS Result, 'Item not found' AS Message;
        RETURN;
    END

    IF @UserStones < @Price
    BEGIN
        SELECT 0 AS Result, 'Not enough stones' AS Message;
        RETURN;
    END

    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Deduct Stones
        UPDATE Users SET Stones = Stones - @Price WHERE Id = @UserId;

        -- Add to Inventory (or update quantity)
        IF EXISTS (SELECT 1 FROM UserItems WHERE UserId = @UserId AND ItemId = @ItemId)
        BEGIN
            UPDATE UserItems SET Quantity = Quantity + 1 WHERE UserId = @UserId AND ItemId = @ItemId;
        END
        ELSE
        BEGIN
            INSERT INTO UserItems (UserId, ItemId, Quantity) VALUES (@UserId, @ItemId, 1);
        END

        -- Log Transaction
        INSERT INTO Transactions (UserId, ItemId, Price) VALUES (@UserId, @ItemId, @Price);

        COMMIT TRANSACTION;
        SELECT 1 AS Result, 'Purchase successful' AS Message, @UserStones - @Price AS NewBalance;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT -2 AS Result, 'Transaction failed' AS Message;
    END CATCH
END
GO

IF OBJECT_ID('sp_GetLeaderboard', 'P') IS NOT NULL DROP PROCEDURE sp_GetLeaderboard
GO
CREATE PROCEDURE [dbo].[sp_GetLeaderboard]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 10 Id, Username, AvatarUrl, Rank, Exp, Stones 
    FROM Users 
    ORDER BY Exp DESC;
END
GO

-- Seed Items
IF NOT EXISTS (SELECT 1 FROM Items)
BEGIN
    INSERT INTO Items (Name, Price, Description, Icon, Type)
    VALUES 
    (N'Trúc Cơ Đan', 500, N'Tăng 10% tỉ lệ đột phá Trúc Cơ', N'💊', 'consumable'),
    (N'Tụ Khí Tán', 100, N'Tăng 200 EXP ngay lập tức', N'🧪', 'consumable'),
    (N'Kiếm Gỗ Đào', 1000, N'Vật phẩm trang trí, trừ tà', N'🗡️', 'equipment'),
    (N'Thẻ VIP 1 Tháng', 5000, N'X2 tốc độ tu luyện trong 30 ngày', N'🎫', 'special');
END
GO

IF OBJECT_ID('sp_GetWatchProgress', 'P') IS NOT NULL DROP PROCEDURE sp_GetWatchProgress
GO
CREATE PROCEDURE [dbo].[sp_GetWatchProgress]
    @UserId int,
    @MovieId int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ProgressSeconds FROM WatchHistory WHERE UserId = @UserId AND MovieId = @MovieId;
END
GO
