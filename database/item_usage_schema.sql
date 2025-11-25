-- Item Usage System Database Schema
-- Phase 1: Week 1
-- Creates tables for tracking buffs and item usage

-- ============================================
-- USER BUFFS TABLE
-- ============================================
-- Tracks active temporary buffs on users (from pills, skills, etc.)
CREATE TABLE IF NOT EXISTS UserBuffs (
    Id SERIAL PRIMARY KEY,
    UserId INT NOT NULL,
    BuffType VARCHAR(50) NOT NULL, -- 'hp', 'atk', 'def', 'spd', 'exp'
    BuffValue DECIMAL(10,2) NOT NULL, -- Amount or percentage
    IsPercentage BOOLEAN DEFAULT FALSE, -- TRUE = percentage buff, FALSE = flat
    AppliedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt TIMESTAMP, -- NULL = permanent buff
    SourceItemId INT, -- Which item created this buff
    Active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_user_buffs_user FOREIGN KEY (UserId) REFERENCES "Users"("Id") ON DELETE CASCADE,
    CONSTRAINT fk_user_buffs_item FOREIGN KEY (SourceItemId) REFERENCES "Items"("Id") ON DELETE SET NULL
);

-- ============================================
-- ITEM USAGE LOG TABLE
-- ============================================
-- Logs all item usage for analytics and debugging
CREATE TABLE IF NOT EXISTS ItemUsageLog (
    Id SERIAL PRIMARY KEY,
    UserId INT NOT NULL,
    ItemId INT NOT NULL,
    Quantity INT DEFAULT 1,
    UsedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EffectApplied TEXT, -- JSON string of effect (e.g., '{"type": "exp", "value": 100}')
    Success BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_item_usage_user FOREIGN KEY (UserId) REFERENCES "Users"("Id") ON DELETE CASCADE,
    CONSTRAINT fk_item_usage_item FOREIGN KEY (ItemId) REFERENCES "Items"("Id") ON DELETE CASCADE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_buffs_user ON UserBuffs(UserId);
CREATE INDEX IF NOT EXISTS idx_user_buffs_expires ON UserBuffs(ExpiresAt);
CREATE INDEX IF NOT EXISTS idx_user_buffs_active ON UserBuffs(Active);
CREATE INDEX IF NOT EXISTS idx_item_usage_user ON ItemUsageLog(UserId);
CREATE INDEX IF NOT EXISTS idx_item_usage_item ON ItemUsageLog(ItemId);
CREATE INDEX IF NOT EXISTS idx_item_usage_date ON ItemUsageLog(UsedAt);

-- ============================================
-- CLEANUP FUNCTION (Run daily to remove expired buffs)
-- ============================================
-- This function can be called manually or set up as a cron job
CREATE OR REPLACE FUNCTION cleanup_expired_buffs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM UserBuffs 
    WHERE ExpiresAt IS NOT NULL 
    AND ExpiresAt < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check tables created successfully
SELECT 'UserBuffs' as table_name, COUNT(*) as row_count FROM UserBuffs
UNION ALL
SELECT 'ItemUsageLog', COUNT(*) FROM ItemUsageLog;

-- Verify indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('UserBuffs', 'ItemUsageLog')
ORDER BY tablename, indexname;
