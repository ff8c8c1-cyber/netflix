-- Create SectSkills table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SectSkills]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SectSkills](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Name] [nvarchar](100) NOT NULL,
        [Description] [nvarchar](255) NULL,
        [EffectType] [varchar](50) NOT NULL, -- 'PASSIVE_EXP', 'PASSIVE_ATK', 'PASSIVE_DEF'
        [EffectValue] [float] NOT NULL, -- e.g. 0.05 for 5% or 10 for flat value
        [CostContribution] [int] NOT NULL,
        [ReqSectLevel] [int] DEFAULT 1,
        PRIMARY KEY CLUSTERED ([Id] ASC)
    )
END

-- Create UserSectSkills table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSectSkills]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserSectSkills](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [UserId] [int] NOT NULL,
        [SkillId] [int] NOT NULL,
        [LearnedAt] [datetime] DEFAULT GETDATE(),
        PRIMARY KEY CLUSTERED ([Id] ASC),
        FOREIGN KEY ([SkillId]) REFERENCES [dbo].[SectSkills] ([Id])
    )
END

-- Seed Initial Skills
IF NOT EXISTS (SELECT * FROM SectSkills WHERE Name = N'Tụ Khí Quyết')
BEGIN
    INSERT INTO SectSkills (Name, Description, EffectType, EffectValue, CostContribution, ReqSectLevel)
    VALUES 
    (N'Tụ Khí Quyết', N'Tăng 5% tốc độ tu luyện (Exp nhận được).', 'PASSIVE_EXP', 0.05, 500, 1),
    (N'Kim Cang Thân', N'Tăng 10 điểm phòng thủ cơ bản.', 'PASSIVE_DEF', 10, 1000, 2),
    (N'Liệt Hỏa Chưởng', N'Tăng 15 điểm tấn công cơ bản.', 'PASSIVE_ATK', 15, 1500, 3),
    (N'Thanh Tâm Chú', N'Tăng 10% tốc độ tu luyện.', 'PASSIVE_EXP', 0.10, 2000, 4),
    (N'Lăng Ba Vi Bộ', N'Tăng 20 điểm thân pháp (Né tránh).', 'PASSIVE_AGI', 20, 3000, 5)
END
