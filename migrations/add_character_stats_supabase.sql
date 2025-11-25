-- =============================================
-- Character Stats System - Supabase/PostgreSQL Migration
-- =============================================

-- STEP 1: Add Stats Columns to Users Table
-- =============================================

ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "MaxHp" INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS "CurrentHp" INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS "MaxMp" INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS "CurrentMp" INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS "BaseAtk" INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS "BaseDef" INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS "BaseSpd" INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS "BaseCri" DECIMAL(5,2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS "BaseLuk" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "TotalAtk" INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS "TotalDef" INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS "TotalSpd" INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS "TotalCri" DECIMAL(5,2) DEFAULT 5.0;

-- STEP 2: Create UserBuffs Table
-- =============================================

CREATE TABLE IF NOT EXISTS "UserBuffs" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id"),
    "BuffType" VARCHAR(20) NOT NULL,
    "BuffValue" INTEGER NOT NULL,
    "IsPercentage" BOOLEAN DEFAULT false,
    "AppliedAt" TIMESTAMP DEFAULT NOW(),
    "ExpiresAt" TIMESTAMP,
    "SourceType" VARCHAR(20),
    "SourceItemId" INTEGER,
    "Active" BOOLEAN DEFAULT true,
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_buffs_user ON "UserBuffs"("UserId");
CREATE INDEX IF NOT EXISTS idx_user_buffs_active ON "UserBuffs"("Active", "ExpiresAt");

-- STEP 3: Function - Initialize User Stats by Rank
-- =============================================

CREATE OR REPLACE FUNCTION initialize_user_stats(
    p_user_id INTEGER,
    p_rank INTEGER
)
RETURNS TABLE (
    message TEXT
) AS $$
DECLARE
    v_max_hp INTEGER;
    v_max_mp INTEGER;
    v_base_atk INTEGER;
    v_base_def INTEGER;
    v_base_spd INTEGER;
    v_base_cri DECIMAL(5,2);
BEGIN
    -- Stats based on rank
    CASE p_rank
        WHEN 0 THEN -- Phàm Nhân
            v_max_hp := 100; v_max_mp := 50;
            v_base_atk := 10; v_base_def := 5; v_base_spd := 10; v_base_cri := 5.0;
        WHEN 1 THEN -- Trúc Cơ
            v_max_hp := 500; v_max_mp := 200;
            v_base_atk := 30; v_base_def := 20; v_base_spd := 15; v_base_cri := 8.0;
        WHEN 2 THEN -- Kết Đan
            v_max_hp := 1500; v_max_mp := 600;
            v_base_atk := 80; v_base_def := 50; v_base_spd := 25; v_base_cri := 12.0;
        WHEN 3 THEN -- Nguyên Anh
            v_max_hp := 5000; v_max_mp := 2000;
            v_base_atk := 200; v_base_def := 120; v_base_spd := 40; v_base_cri := 18.0;
        WHEN 4 THEN -- Hóa Thần
            v_max_hp := 15000; v_max_mp := 6000;
            v_base_atk := 500; v_base_def := 300; v_base_spd := 60; v_base_cri := 25.0;
        WHEN 5 THEN -- Luyện Hư
            v_max_hp := 50000; v_max_mp := 20000;
            v_base_atk := 1200; v_base_def := 800; v_base_spd := 100; v_base_cri := 35.0;
        ELSE -- Default to Phàm Nhân
            v_max_hp := 100; v_max_mp := 50;
            v_base_atk := 10; v_base_def := 5; v_base_spd := 10; v_base_cri := 5.0;
    END CASE;
    
    UPDATE "Users" SET
        "MaxHp" = v_max_hp,
        "CurrentHp" = v_max_hp,
        "MaxMp" = v_max_mp,
        "CurrentMp" = v_max_mp,
        "BaseAtk" = v_base_atk,
        "BaseDef" = v_base_def,
        "BaseSpd" = v_base_spd,
        "BaseCri" = v_base_cri,
        "BaseLuk" = 0,
        "TotalAtk" = v_base_atk,
        "TotalDef" = v_base_def,
        "TotalSpd" = v_base_spd,
        "TotalCri" = v_base_cri
    WHERE "Id" = p_user_id;
    
    RETURN QUERY SELECT 'Stats initialized'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: Function - Calculate Total Stats
-- =============================================

CREATE OR REPLACE FUNCTION calculate_total_stats(p_user_id INTEGER)
RETURNS TABLE (
    "BaseAtk" INTEGER,
    "BaseDef" INTEGER,
    "BaseSpd" INTEGER,
    "BaseCri" DECIMAL(5,2),
    "BaseLuk" INTEGER,
    "TotalAtk" INTEGER,
    "TotalDef" INTEGER,
    "TotalSpd" INTEGER,
    "TotalCri" DECIMAL(5,2),
    "MaxHp" INTEGER,
    "CurrentHp" INTEGER,
    "MaxMp" INTEGER,
    "CurrentMp" INTEGER
) AS $$
DECLARE
    v_base_atk INTEGER;
    v_base_def INTEGER;
    v_base_spd INTEGER;
    v_base_cri DECIMAL(5,2);
    v_total_atk INTEGER;
    v_total_def INTEGER;
    v_total_spd INTEGER;
    v_total_cri DECIMAL(5,2);
    buff RECORD;
BEGIN
    -- Get base stats
    SELECT u."BaseAtk", u."BaseDef", u."BaseSpd", u."BaseCri"
    INTO v_base_atk, v_base_def, v_base_spd, v_base_cri
    FROM "Users" u WHERE u."Id" = p_user_id;
    
    -- Initialize totals with base
    v_total_atk := v_base_atk;
    v_total_def := v_base_def;
    v_total_spd := v_base_spd;
    v_total_cri := v_base_cri;
    
    -- Apply active buffs
    FOR buff IN 
        SELECT "BuffType", "BuffValue", "IsPercentage"
        FROM "UserBuffs"
        WHERE "UserId" = p_user_id 
            AND "Active" = true 
            AND ("ExpiresAt" IS NULL OR "ExpiresAt" > NOW())
    LOOP
        CASE buff."BuffType"
            WHEN 'atk' THEN
                IF buff."IsPercentage" THEN
                    v_total_atk := FLOOR(v_total_atk * (1.0 + buff."BuffValue" / 100.0));
                ELSE
                    v_total_atk := v_total_atk + buff."BuffValue";
                END IF;
            WHEN 'def' THEN
                IF buff."IsPercentage" THEN
                    v_total_def := FLOOR(v_total_def * (1.0 + buff."BuffValue" / 100.0));
                ELSE
                    v_total_def := v_total_def + buff."BuffValue";
                END IF;
            WHEN 'spd' THEN
                IF buff."IsPercentage" THEN
                    v_total_spd := FLOOR(v_total_spd * (1.0 + buff."BuffValue" / 100.0));
                ELSE
                    v_total_spd := v_total_spd + buff."BuffValue";
                END IF;
            WHEN 'cri' THEN
                IF buff."IsPercentage" THEN
                    v_total_cri := v_total_cri * (1.0 + buff."BuffValue" / 100.0);
                ELSE
                    v_total_cri := v_total_cri + buff."BuffValue";
                END IF;
        END CASE;
    END LOOP;
    
    -- Update cached totals
    UPDATE "Users" SET
        "TotalAtk" = v_total_atk,
        "TotalDef" = v_total_def,
        "TotalSpd" = v_total_spd,
        "TotalCri" = v_total_cri
    WHERE "Id" = p_user_id;
    
    -- Return stats
    RETURN QUERY
    SELECT 
        u."BaseAtk", u."BaseDef", u."BaseSpd", u."BaseCri", u."BaseLuk",
        u."TotalAtk", u."TotalDef", u."TotalSpd", u."TotalCri",
        u."MaxHp", u."CurrentHp", u."MaxMp", u."CurrentMp"
    FROM "Users" u WHERE u."Id" = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: Function - Apply Buff
-- =============================================

CREATE OR REPLACE FUNCTION apply_buff(
    p_user_id INTEGER,
    p_buff_type VARCHAR(20),
    p_buff_value INTEGER,
    p_is_percentage BOOLEAN DEFAULT false,
    p_duration_minutes INTEGER DEFAULT NULL,
    p_source_type VARCHAR(20) DEFAULT 'pill',
    p_source_item_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    "Id" INTEGER,
    "BuffType" VARCHAR(20),
    "BuffValue" INTEGER,
    "IsPercentage" BOOLEAN,
    "AppliedAt" TIMESTAMP,
    "ExpiresAt" TIMESTAMP
) AS $$
DECLARE
    v_expires_at TIMESTAMP := NULL;
    v_buff_id INTEGER;
BEGIN
    IF p_duration_minutes IS NOT NULL THEN
        v_expires_at := NOW() + (p_duration_minutes || ' minutes')::INTERVAL;
    END IF;
    
    INSERT INTO "UserBuffs" (
        "UserId", "BuffType", "BuffValue", "IsPercentage", 
        "ExpiresAt", "SourceType", "SourceItemId"
    )
    VALUES (
        p_user_id, p_buff_type, p_buff_value, p_is_percentage,
        v_expires_at, p_source_type, p_source_item_id
    )
    RETURNING "UserBuffs"."Id" INTO v_buff_id;
    
    -- Recalculate total stats
    PERFORM calculate_total_stats(p_user_id);
    
    RETURN QUERY
    SELECT 
        ub."Id", ub."BuffType", ub."BuffValue", ub."IsPercentage",
        ub."AppliedAt", ub."ExpiresAt"
    FROM "UserBuffs" ub WHERE ub."Id" = v_buff_id;
END;
$$ LANGUAGE plpgsql;

-- STEP 6: Function - Get User Stats with Buffs
-- =============================================

CREATE OR REPLACE FUNCTION get_user_stats(p_user_id INTEGER)
RETURNS JSON AS $$
DECLARE
    v_stats JSON;
    v_buffs JSON;
    v_result JSON;
BEGIN
    -- Recalculate first
    PERFORM calculate_total_stats(p_user_id);
    
    -- Get base and total stats
    SELECT json_build_object(
        'maxHp', "MaxHp",
        'currentHp', "CurrentHp",
        'maxMp', "MaxMp",
        'currentMp', "CurrentMp",
        'base', json_build_object(
            'atk', "BaseAtk",
            'def', "BaseDef",
            'spd', "BaseSpd",
            'cri', "BaseCri",
            'luk', "BaseLuk"
        ),
        'total', json_build_object(
            'atk', "TotalAtk",
            'def', "TotalDef",
            'spd', "TotalSpd",
            'cri', "TotalCri"
        )
    ) INTO v_stats
    FROM "Users" WHERE "Id" = p_user_id;
    
    -- Get active buffs
    SELECT COALESCE(json_agg(json_build_object(
        'id', "Id",
        'buffType', "BuffType",
        'buffValue', "BuffValue",
        'isPercentage', "IsPercentage",
        'appliedAt', "AppliedAt",
        'expiresAt', "ExpiresAt",
        'sourceType', "SourceType",
        'sourceItemId', "SourceItemId",
        'remainingSeconds', CASE 
            WHEN "ExpiresAt" IS NULL THEN -1
            ELSE EXTRACT(EPOCH FROM ("ExpiresAt" - NOW()))::INTEGER
        END
    )), '[]'::json) INTO v_buffs
    FROM "UserBuffs"
    WHERE "UserId" = p_user_id 
        AND "Active" = true 
        AND ("ExpiresAt" IS NULL OR "ExpiresAt" > NOW())
    ORDER BY "AppliedAt" DESC;
    
    v_result := v_stats || json_build_object('buffs', v_buffs);
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- STEP 7: Function - Clean Expired Buffs
-- =============================================

CREATE OR REPLACE FUNCTION clean_expired_buffs()
RETURNS TABLE (
    expired_count INTEGER
) AS $$
DECLARE
    v_affected_users INTEGER[];
    v_user_id INTEGER;
BEGIN
    -- Deactivate expired buffs and collect affected users
    WITH deactivated AS (
        UPDATE "UserBuffs" SET "Active" = false
        WHERE "Active" = true 
            AND "ExpiresAt" IS NOT NULL 
            AND "ExpiresAt" < NOW()
        RETURNING "UserId"
    )
    SELECT array_agg(DISTINCT "UserId") INTO v_affected_users FROM deactivated;
    
    -- Recalculate stats for affected users
    IF v_affected_users IS NOT NULL THEN
        FOREACH v_user_id IN ARRAY v_affected_users
        LOOP
            PERFORM calculate_total_stats(v_user_id);
        END LOOP;
    END IF;
    
    RETURN QUERY SELECT array_length(v_affected_users, 1);
END;
$$ LANGUAGE plpgsql;

-- STEP 8: Initialize Stats for Existing Users
-- =============================================

DO $$
DECLARE
    user_rec RECORD;
BEGIN
    FOR user_rec IN 
        SELECT "Id", "Rank" FROM "Users" 
        WHERE "MaxHp" IS NULL OR "MaxHp" = 0
    LOOP
        PERFORM initialize_user_stats(user_rec."Id", user_rec."Rank");
    END LOOP;
END $$;

-- Success message
SELECT 'Character Stats System migration completed successfully!' AS message;
