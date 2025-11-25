-- =============================================
-- Character Stats System - SQL Server Migration
-- =============================================

-- STEP 1: Add Stats Columns to Users Table
-- =============================================

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'MaxHp')
BEGIN
    ALTER TABLE Users ADD MaxHp INT DEFAULT 100;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'CurrentHp')
BEGIN
    ALTER TABLE Users ADD CurrentHp INT DEFAULT 100;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'MaxMp')
BEGIN
    ALTER TABLE Users ADD MaxMp INT DEFAULT 100;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'CurrentMp')
BEGIN
    ALTER TABLE Users ADD CurrentMp INT DEFAULT 100;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'BaseAtk')
BEGIN
    ALTER TABLE Users ADD BaseAtk INT DEFAULT 10;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'BaseDef')
BEGIN
    ALTER TABLE Users ADD BaseDef INT DEFAULT 5;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'BaseSpd')
BEGIN
    ALTER TABLE Users ADD BaseSpd INT DEFAULT 10;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'BaseCri')
BEGIN
    ALTER TABLE Users ADD BaseCri DECIMAL(5,2) DEFAULT 5.0;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'BaseLuk')
BEGIN
    ALTER TABLE Users ADD BaseLuk INT DEFAULT 0;
END

-- Total stats (cached)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'TotalAtk')
BEGIN
    ALTER TABLE Users ADD TotalAtk INT DEFAULT 10;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'TotalDef')
BEGIN
    ALTER TABLE Users ADD TotalDef INT DEFAULT 5;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'TotalSpd')
BEGIN
    ALTER TABLE Users ADD TotalSpd INT DEFAULT 10;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'TotalCri')
BEGIN
    ALTER TABLE Users ADD TotalCri DECIMAL(5,2) DEFAULT 5.0;
END

PRINT 'Stats columns added to Users table';
GO

-- STEP 2: Create UserBuffs Table
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserBuffs]') AND type in (N'U'))
BEGIN
    CREATE TABLE UserBuffs (
        Id INT PRIMARY KEY IDENTITY,
        UserId INT NOT NULL FOREIGN KEY REFERENCES Users(Id),
        BuffType VARCHAR(20) NOT NULL, -- atk, def, spd, hp, mp, exp, cri
        BuffValue INT NOT NULL,
        IsPercentage BIT DEFAULT 0,
        AppliedAt DATETIME DEFAULT GETDATE(),
        ExpiresAt DATETIME NULL,
        SourceType VARCHAR(20), -- pill, skill, equipment
        SourceItemId INT NULL,
        Active BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE()
    );

    CREATE INDEX idx_user_buffs_user ON UserBuffs(UserId);
    CREATE INDEX idx_user_buffs_active ON UserBuffs(Active, ExpiresAt);
    
    PRINT 'UserBuffs table created';
END
GO

-- STEP 3: Stored Procedure - Initialize User Stats by Rank
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_InitializeUserStats]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[sp_InitializeUserStats];
GO

CREATE PROCEDURE sp_InitializeUserStats
    @UserId INT,
    @Rank INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaxHp INT, @MaxMp INT, @BaseAtk INT, @BaseDef INT, @BaseSpd INT, @BaseCri DECIMAL(5,2);
    
    -- Stats based on rank
    IF @Rank = 0 -- Phàm Nhân
    BEGIN
        SET @MaxHp = 100; SET @MaxMp = 50;
        SET @BaseAtk = 10; SET @BaseDef = 5; SET @BaseSpd = 10; SET @BaseCri = 5.0;
    END
    ELSE IF @Rank = 1 -- Trúc Cơ
    BEGIN
        SET @MaxHp = 500; SET @MaxMp = 200;
        SET @BaseAtk = 30; SET @BaseDef = 20; SET @BaseSpd = 15; SET @BaseCri = 8.0;
    END
    ELSE IF @Rank = 2 -- Kết Đan
    BEGIN
        SET @MaxHp = 1500; SET @MaxMp = 600;
        SET @BaseAtk = 80; SET @BaseDef = 50; SET @BaseSpd = 25; SET @BaseCri = 12.0;
    END
    ELSE IF @Rank = 3 -- Nguyên Anh
    BEGIN
        SET @MaxHp = 5000; SET @MaxMp = 2000;
        SET @BaseAtk = 200; SET @BaseDef = 120; SET @BaseSpd = 40; SET @BaseCri = 18.0;
    END
    ELSE IF @Rank = 4 -- Hóa Thần
    BEGIN
        SET @MaxHp = 15000; SET @MaxMp = 6000;
        SET @BaseAtk = 500; SET @BaseDef = 300; SET @BaseSpd = 60; SET @BaseCri = 25.0;
    END
    ELSE IF @Rank = 5 -- Luyện Hư
    BEGIN
        SET @MaxHp = 50000; SET @MaxMp = 20000;
        SET @BaseAtk = 1200; SET @BaseDef = 800; SET @BaseSpd = 100; SET @BaseCri = 35.0;
    END
    ELSE
    BEGIN
        -- Default to Phàm Nhân
        SET @MaxHp = 100; SET @MaxMp = 50;
        SET @BaseAtk = 10; SET @BaseDef = 5; SET @BaseSpd = 10; SET @BaseCri = 5.0;
    END
    
    UPDATE Users SET
        MaxHp = @MaxHp,
        CurrentHp = @MaxHp,
        MaxMp = @MaxMp,
        CurrentMp = @MaxMp,
        BaseAtk = @BaseAtk,
        BaseDef = @BaseDef,
        BaseSpd = @BaseSpd,
        BaseCri = @BaseCri,
        BaseLuk = 0,
        TotalAtk = @BaseAtk,
        TotalDef = @BaseDef,
        TotalSpd = @BaseSpd,
        TotalCri = @BaseCri
    WHERE Id = @UserId;
    
    SELECT 'Stats initialized' AS Message;
END
GO

PRINT 'sp_InitializeUserStats created';
GO

-- STEP 4: Stored Procedure - Calculate Total Stats
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CalculateTotalStats]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[sp_CalculateTotalStats];
GO

CREATE PROCEDURE sp_CalculateTotalStats
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get base stats
    DECLARE @BaseAtk INT, @BaseDef INT, @BaseSpd INT, @BaseCri DECIMAL(5,2);
    
    SELECT 
        @BaseAtk = BaseAtk,
        @BaseDef = BaseDef,
        @BaseSpd = BaseSpd,
        @BaseCri = BaseCri
    FROM Users WHERE Id = @UserId;
    
    -- Initialize totals with base
    DECLARE @TotalAtk INT = @BaseAtk;
    DECLARE @TotalDef INT = @BaseDef;
    DECLARE @TotalSpd INT = @BaseSpd;
    DECLARE @TotalCri DECIMAL(5,2) = @BaseCri;
    
    -- Apply buffs
    DECLARE @BuffType VARCHAR(20), @BuffValue INT, @IsPercentage BIT;
    
    DECLARE buff_cursor CURSOR FOR
    SELECT BuffType, BuffValue, IsPercentage
    FROM UserBuffs
    WHERE UserId = @UserId 
        AND Active = 1 
        AND (ExpiresAt IS NULL OR ExpiresAt > GETDATE());
    
    OPEN buff_cursor;
    FETCH NEXT FROM buff_cursor INTO @BuffType, @BuffValue, @IsPercentage;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF @BuffType = 'atk'
        BEGIN
            IF @IsPercentage = 1
                SET @TotalAtk = FLOOR(@TotalAtk * (1.0 + @BuffValue / 100.0));
            ELSE
                SET @TotalAtk = @TotalAtk + @BuffValue;
        END
        ELSE IF @BuffType = 'def'
        BEGIN
            IF @IsPercentage = 1
                SET @TotalDef = FLOOR(@TotalDef * (1.0 + @BuffValue / 100.0));
            ELSE
                SET @TotalDef = @TotalDef + @BuffValue;
        END
        ELSE IF @BuffType = 'spd'
        BEGIN
            IF @IsPercentage = 1
                SET @TotalSpd = FLOOR(@TotalSpd * (1.0 + @BuffValue / 100.0));
            ELSE
                SET @TotalSpd = @TotalSpd + @BuffValue;
        END
        ELSE IF @BuffType = 'cri'
        BEGIN
            IF @IsPercentage = 1
                SET @TotalCri = @TotalCri * (1.0 + @BuffValue / 100.0);
            ELSE
                SET @TotalCri = @TotalCri + @BuffValue;
        END
        
        FETCH NEXT FROM buff_cursor INTO @BuffType, @BuffValue, @IsPercentage;
    END
    
    CLOSE buff_cursor;
    DEALLOCATE buff_cursor;
    
    -- Update cached totals
    UPDATE Users SET
        TotalAtk = @TotalAtk,
        TotalDef = @TotalDef,
        TotalSpd = @TotalSpd,
        TotalCri = @TotalCri
    WHERE Id = @UserId;
    
    -- Return stats
    SELECT 
        BaseAtk, BaseDef, BaseSpd, BaseCri, BaseLuk,
        TotalAtk, TotalDef, TotalSpd, TotalCri,
        MaxHp, CurrentHp, MaxMp, CurrentMp
    FROM Users WHERE Id = @UserId;
END
GO

PRINT 'sp_CalculateTotalStats created';
GO

-- STEP 5: Stored Procedure - Apply Buff
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_ApplyBuff]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[sp_ApplyBuff];
GO

CREATE PROCEDURE sp_ApplyBuff
    @UserId INT,
    @BuffType VARCHAR(20),
    @BuffValue INT,
    @IsPercentage BIT = 0,
    @DurationMinutes INT = NULL,
    @SourceType VARCHAR(20) = 'pill',
    @SourceItemId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ExpiresAt DATETIME = NULL;
    
    IF @DurationMinutes IS NOT NULL
        SET @ExpiresAt = DATEADD(MINUTE, @DurationMinutes, GETDATE());
    
    INSERT INTO UserBuffs (UserId, BuffType, BuffValue, IsPercentage, ExpiresAt, SourceType, SourceItemId)
    VALUES (@UserId, @BuffType, @BuffValue, @IsPercentage, @ExpiresAt, @SourceType, @SourceItemId);
    
    DECLARE @BuffId INT = SCOPE_IDENTITY();
    
    -- Recalculate total stats
    EXEC sp_CalculateTotalStats @UserId;
    
    SELECT 
        Id, BuffType, BuffValue, IsPercentage, AppliedAt, ExpiresAt
    FROM UserBuffs WHERE Id = @BuffId;
END
GO

PRINT 'sp_ApplyBuff created';
GO

-- STEP 6: Stored Procedure - Get User Stats with Buffs
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetUserStats]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[sp_GetUserStats];
GO

CREATE PROCEDURE sp_GetUserStats
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Recalculate first to ensure accuracy
    EXEC sp_CalculateTotalStats @UserId;
    
    -- Return base and total stats
    SELECT 
        MaxHp, CurrentHp, MaxMp, CurrentMp,
        BaseAtk, BaseDef, BaseSpd, BaseCri, BaseLuk,
        TotalAtk, TotalDef, TotalSpd, TotalCri
    FROM Users WHERE Id = @UserId;
    
    -- Return active buffs
    SELECT 
        Id, BuffType, BuffValue, IsPercentage,
        AppliedAt, ExpiresAt, SourceType, SourceItemId,
        CASE 
            WHEN ExpiresAt IS NULL THEN -1
            ELSE DATEDIFF(SECOND, GETDATE(), ExpiresAt)
        END AS RemainingSeconds
    FROM UserBuffs
    WHERE UserId = @UserId 
        AND Active = 1 
        AND (ExpiresAt IS NULL OR ExpiresAt > GETDATE())
    ORDER BY AppliedAt DESC;
END
GO

PRINT 'sp_GetUserStats created';
GO

-- STEP 7: Stored Procedure - Clean Expired Buffs
-- =============================================

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CleanExpiredBuffs]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[sp_CleanExpiredBuffs];
GO

CREATE PROCEDURE sp_CleanExpiredBuffs
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Deactivate expired buffs
    UPDATE UserBuffs SET Active = 0
    WHERE Active = 1 
        AND ExpiresAt IS NOT NULL 
        AND ExpiresAt < GETDATE();
    
    DECLARE @AffectedUsers TABLE (UserId INT);
    
    INSERT INTO @AffectedUsers
    SELECT DISTINCT UserId FROM UserBuffs WHERE Active = 0 AND ExpiresAt < GETDATE();
    
    -- Recalculate stats for affected users
    DECLARE @UserId INT;
    DECLARE user_cursor CURSOR FOR SELECT UserId FROM @AffectedUsers;
    
    OPEN user_cursor;
    FETCH NEXT FROM user_cursor INTO @UserId;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_CalculateTotalStats @UserId;
        FETCH NEXT FROM user_cursor INTO @UserId;
    END
    
    CLOSE user_cursor;
    DEALLOCATE user_cursor;
    
    SELECT @@ROWCOUNT AS ExpiredBuffsCount;
END
GO

PRINT 'sp_CleanExpiredBuffs created';
GO

-- STEP 8: Initialize Stats for Existing Users
-- =============================================

DECLARE @UserId INT, @Rank INT;
DECLARE user_cursor CURSOR FOR 
    SELECT Id, Rank FROM Users WHERE MaxHp IS NULL OR MaxHp = 0;

OPEN user_cursor;
FETCH NEXT FROM user_cursor INTO @UserId, @Rank;

WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC sp_InitializeUserStats @UserId, @Rank;
    FETCH NEXT FROM user_cursor INTO @UserId, @Rank;
END

CLOSE user_cursor;
DEALLOCATE user_cursor;

PRINT 'Existing users stats initialized';
GO

PRINT 'Character Stats System migration completed successfully!';
GO
