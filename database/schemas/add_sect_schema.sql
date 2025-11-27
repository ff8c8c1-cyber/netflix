-- 1. Sects Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Sects]') AND type in (N'U'))
BEGIN
    CREATE TABLE Sects (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL UNIQUE,
        Description NVARCHAR(500),
        LeaderId INT NOT NULL, -- References Users(Id)
        Level INT DEFAULT 1,
        Exp INT DEFAULT 0,
        Resources INT DEFAULT 0, -- Shared currency for upgrades
        CreatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (LeaderId) REFERENCES Users(Id)
    )
END

-- 2. SectMembers Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SectMembers]') AND type in (N'U'))
BEGIN
    CREATE TABLE SectMembers (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        SectId INT NOT NULL,
        UserId INT NOT NULL UNIQUE, -- User can only be in one sect
        Role NVARCHAR(20) DEFAULT 'Member', -- 'Leader', 'Elder', 'Core', 'Inner', 'Outer'
        Contribution INT DEFAULT 0, -- Personal contribution points
        SalaryClaimedAt DATETIME NULL,
        JoinedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (SectId) REFERENCES Sects(Id),
        FOREIGN KEY (UserId) REFERENCES Users(Id)
    )
END

-- 3. SectBuildings Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SectBuildings]') AND type in (N'U'))
BEGIN
    CREATE TABLE SectBuildings (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        SectId INT NOT NULL,
        Type NVARCHAR(50) NOT NULL, -- 'MainHall', 'Pavilion', 'Alchemy', 'Vein', 'Mission'
        Level INT DEFAULT 1,
        FOREIGN KEY (SectId) REFERENCES Sects(Id)
    )
END

-- 4. SectMissions Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SectMissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE SectMissions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        RewardContribution INT DEFAULT 10,
        RewardResources INT DEFAULT 10,
        Difficulty NVARCHAR(20) DEFAULT 'Easy', -- 'Easy', 'Medium', 'Hard', 'Nightmare'
        CreatedAt DATETIME DEFAULT GETDATE()
    )
END

-- 5. SectMemberMissions Table (Track progress)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SectMemberMissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE SectMemberMissions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        MissionId INT NOT NULL,
        Status NVARCHAR(20) DEFAULT 'InProgress', -- 'InProgress', 'Completed'
        CompletedAt DATETIME NULL,
        FOREIGN KEY (UserId) REFERENCES Users(Id),
        FOREIGN KEY (MissionId) REFERENCES SectMissions(Id)
    )
END
