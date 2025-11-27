USE TienGioiDB;
GO

-- Add MysteryBags column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'MysteryBags')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [MysteryBags] [int] DEFAULT 0;
END
GO

-- Create or Alter sp_UpdateUser
IF OBJECT_ID('sp_UpdateUser', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateUser
GO
CREATE PROCEDURE [dbo].[sp_UpdateUser]
    @Id int,
    @Username nvarchar(50),
    @Role nvarchar(20) = 'user', -- Assuming you might add a Role column later or handle it differently, but for now let's just accept it even if unused in DB to match frontend
    @Rank int,
    @Exp int,
    @Stones int,
    @MysteryBags int
AS
BEGIN
    SET NOCOUNT ON;
    -- Note: Role is not in the Users table schema provided, so we skip updating it for now unless we add it. 
    -- The frontend sends it, but the DB doesn't have it. 
    -- Let's assume for now we only update what's in the DB.
    
    UPDATE Users 
    SET Username = @Username, 
        Rank = @Rank, 
        Exp = @Exp, 
        Stones = @Stones,
        MysteryBags = @MysteryBags
    WHERE Id = @Id;

    SELECT * FROM Users WHERE Id = @Id;
END
GO

-- Create or Alter sp_DeleteUser
IF OBJECT_ID('sp_DeleteUser', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteUser
GO
CREATE PROCEDURE [dbo].[sp_DeleteUser]
    @Id int
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Delete related data first (Cascading delete manually if FKs don't handle it)
    DELETE FROM WatchHistory WHERE UserId = @Id;
    DELETE FROM Reviews WHERE UserId = @Id;
    DELETE FROM Comments WHERE UserId = @Id;
    DELETE FROM Notifications WHERE UserId = @Id;
    DELETE FROM UserItems WHERE UserId = @Id;
    DELETE FROM Transactions WHERE UserId = @Id;
    
    -- Finally delete the user
    DELETE FROM Users WHERE Id = @Id;
    
    SELECT @@ROWCOUNT AS DeletedCount;
END
GO
