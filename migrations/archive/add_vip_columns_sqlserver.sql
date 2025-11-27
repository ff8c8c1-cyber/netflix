-- VIP System Schema Update for SQL Server
-- Run this on your local SQL Server database

-- Add VIP columns to Users table if they don't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'VipStatus')
BEGIN
    ALTER TABLE Users ADD VipStatus NVARCHAR(20) DEFAULT 'none';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'VipExpiresAt')
BEGIN
    ALTER TABLE Users ADD VipExpiresAt DATETIME NULL;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'VipLastClaim')
BEGIN
    ALTER TABLE Users ADD VipLastClaim DATETIME NULL;
END

PRINT 'VIP columns added successfully to SQL Server!';
GO
