USE TienGioiDB;
GO

IF OBJECT_ID('sp_GetUserHomeStats', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserHomeStats
GO
CREATE PROCEDURE [dbo].[sp_GetUserHomeStats]
    @UserId int
AS
BEGIN
    SET NOCOUNT ON;
    -- Return basic stats for the home page / user sync
    SELECT 
        u.Id, 
        u.Username, 
        u.AvatarUrl, 
        u.Rank, 
        u.Exp, 
        u.Stones, 
        u.MysteryBags,
        u.SectId,
        s.Name as SectName
    FROM Users u
    LEFT JOIN (SELECT 1 as Id, 'Thanh Vân Môn' as Name UNION SELECT 2, 'Hợp Hoan Tông' UNION SELECT 3, 'Vạn Kiếm Sơn') s ON u.SectId = s.Id
    WHERE u.Id = @UserId;
END
GO
