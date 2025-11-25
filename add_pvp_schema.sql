USE TienGioiDB;
GO

-- 1. Update Pets Table with PvP Stats
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Pets]') AND name = 'Elo')
BEGIN
    ALTER TABLE [dbo].[Pets] ADD [Elo] INT DEFAULT 1000;
    PRINT 'Added Elo column to Pets table.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Pets]') AND name = 'Wins')
BEGIN
    ALTER TABLE [dbo].[Pets] ADD [Wins] INT DEFAULT 0;
    PRINT 'Added Wins column to Pets table.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Pets]') AND name = 'Losses')
BEGIN
    ALTER TABLE [dbo].[Pets] ADD [Losses] INT DEFAULT 0;
    PRINT 'Added Losses column to Pets table.';
END
GO

-- 2. Create PvPMatches Table
IF OBJECT_ID(N'[dbo].[PvPMatches]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[PvPMatches](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Player1Id] [int] NOT NULL, -- Challenger
        [Player2Id] [int] NOT NULL, -- Defender
        [WinnerId] [int] NULL,
        [Log] [nvarchar](max) NULL, -- JSON Battle Log
        [CreatedAt] [datetime] DEFAULT GETDATE(),
        CONSTRAINT [PK_PvPMatches] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_PvPMatches_Player1] FOREIGN KEY ([Player1Id]) REFERENCES [dbo].[Users]([Id]),
        CONSTRAINT [FK_PvPMatches_Player2] FOREIGN KEY ([Player2Id]) REFERENCES [dbo].[Users]([Id])
    );
    PRINT 'Created PvPMatches table.';
END
ELSE
BEGIN
    PRINT 'PvPMatches table already exists.';
END
GO
