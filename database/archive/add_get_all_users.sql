USE TienGioiDB;
GO

IF OBJECT_ID('sp_GetAllUsers', 'P') IS NOT NULL DROP PROCEDURE sp_GetAllUsers
GO
CREATE PROCEDURE [dbo].[sp_GetAllUsers]
AS
BEGIN
    SET NOCOUNT ON;
    -- Select all relevant columns. Note: Role is not in DB yet, so we omit it or return 'user' as default
    SELECT Id, Username, Email, 'user' as Role, Rank, Exp, Stones, MysteryBags, CreatedAt FROM Users;
END
GO
