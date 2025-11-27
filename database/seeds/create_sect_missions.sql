-- 1. SectMissions Table (Definitions)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SectMissions' AND xtype='U')
BEGIN
    CREATE TABLE SectMissions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(100),
        Description NVARCHAR(255),
        Type NVARCHAR(50), -- 'Daily', 'Weekly'
        RequirementType NVARCHAR(50), -- 'Contribute', 'Login', 'Hunt'
        RequirementValue INT,
        RewardContribution INT,
        RewardExp INT,
        RewardItemJson NVARCHAR(MAX) -- Optional: JSON string for item rewards
    );
END

-- 2. UserMissions Table (Tracking)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserMissions' AND xtype='U')
BEGIN
    CREATE TABLE UserMissions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT,
        MissionId INT,
        Progress INT DEFAULT 0,
        IsClaimed BIT DEFAULT 0,
        LastUpdated DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (UserId) REFERENCES Users(Id),
        FOREIGN KEY (MissionId) REFERENCES SectMissions(Id)
    );
END

-- 3. Seed Data
IF NOT EXISTS (SELECT * FROM SectMissions)
BEGIN
    INSERT INTO SectMissions (Title, Description, Type, RequirementType, RequirementValue, RewardContribution, RewardExp)
    VALUES 
    (N'Cống Hiến Tông Môn', N'Đóng góp 100 Linh Thạch cho tông môn.', 'Daily', 'Contribute', 100, 50, 100),
    (N'Điểm Danh Hàng Ngày', N'Đăng nhập và vào Tông Môn.', 'Daily', 'Login', 1, 10, 50),
    (N'Tu Luyện Chăm Chỉ', N'Treo máy (AFK) thu hoạch Linh Mạch 1 lần.', 'Daily', 'ClaimVein', 1, 20, 80);
END
