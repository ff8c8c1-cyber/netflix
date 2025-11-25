IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SectMembers]') AND name = 'RoleSalaryClaimedAt')
BEGIN
    ALTER TABLE [dbo].[SectMembers]
    ADD [RoleSalaryClaimedAt] [datetime] NULL
END
