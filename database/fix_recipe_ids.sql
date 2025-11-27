-- =============================================
-- FIX PILL RECIPES - Use ACTUAL Herb IDs from Database
-- =============================================
-- This script rebuilds PillRecipes using ACTUAL herb IDs
-- Run this in Supabase SQL Editor

-- First, clear all existing recipes
DELETE FROM "PillRecipes";

-- =============================================
-- Get ACTUAL IDs and create recipes
-- =============================================

-- Recipe 1: Hoạt Huyết Đan (HP pill)
-- Uses: Hà Thủ Ô x2 + Kỳ Lân Thảo x3
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    -- Get actual IDs from Items table
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Hoạt Huyết Đan' AND "Type" LIKE 'pill_%' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Hà Thủ Ô' AND "Type" = 'herb' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Kỳ Lân Thảo' AND "Type" = 'herb' LIMIT 1;
    
    -- Insert recipe with ACTUAL IDs
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL AND v_herb2_id IS NOT NULL THEN
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 2),
        (v_pill_id, v_herb2_id, 3);
        
        RAISE NOTICE 'Recipe for Hoạt Huyết Đan created (Pill ID: %, Herb IDs: %, %)', v_pill_id, v_herb1_id, v_herb2_id;
    ELSE
        RAISE NOTICE 'Could not create recipe - Missing items';
    END IF;
END $$;

-- Recipe 2: Tụ Khí Tán (EXP pill)
-- Uses: Linh Sâm x3 + Cam Thảo x2 + Kim Ngân Hoa x1
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
    v_herb3_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Tụ Khí Tán' AND "Type" LIKE 'pill_%' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Linh Sâm' AND "Type" = 'herb' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Cam Thảo' AND "Type" = 'herb' LIMIT 1;
    SELECT "Id" INTO v_herb3_id FROM "Items" WHERE "Name" = 'Kim Ngân Hoa' AND "Type" = 'herb' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 3),
        (v_pill_id, v_herb2_id, 2),
        (v_pill_id, v_herb3_id, 1);
        
        RAISE NOTICE 'Recipe for Tụ Khí Tán created (Pill ID: %, Herb IDs: %, %, %)', v_pill_id, v_herb1_id, v_herb2_id, v_herb3_id;
    END IF;
END $$;

-- Recipe 3: Bồi Nguyên Đan
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
    v_herb3_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Bồi Nguyên Đan' AND "Type" = 'pill_exp' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Hoàng Kỳ' AND "Type" = 'herb' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Đương Quy' AND "Type" = 'herb' LIMIT 1;
    SELECT "Id" INTO v_herb3_id FROM "Items" WHERE "Name" = 'Linh Sâm' AND "Type" = 'herb' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 4),
        (v_pill_id, v_herb2_id, 3),
        (v_pill_id, v_herb3_id, 2);
        
        RAISE NOTICE 'Recipe for Bồi Nguyên Đan created';
    END IF;
END $$;

-- Recipe 4: Kim Cang Đan (DEF)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Kim Cang Đan' AND "Type" = 'pill_def' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Bạch Truật' AND "Type" = 'herb' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Địa Hoàng' AND "Type" = 'herb' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 3),
        (v_pill_id, v_herb2_id, 2);
        
        RAISE NOTICE 'Recipe for Kim Cang Đan created';
    END IF;
END $$;

-- Recipe 5: Bạo Lực Đan (ATK)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Bạo Lực Đan' AND "Type" = 'pill_atk' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Ô Đầu' AND "Type" = 'herb' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Xuyên Khung' AND "Type" = 'herb' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 3),
        (v_pill_id, v_herb2_id, 2);
        
        RAISE NOTICE 'Recipe for Bạo Lực Đan created';
    END IF;
END $$;

-- =============================================
-- VERIFICATION
-- =============================================

-- Show all herbs with their IDs
SELECT "Id", "Name", "Type", "Price"
FROM "Items"
WHERE "Type" = 'herb'
ORDER BY "Id";

-- Show all pills with IDs
SELECT "Id", "Name", "Type", "Rarity", "Price"
FROM "Items"
WHERE "Type" LIKE 'pill_%'
ORDER BY "Price";

-- Show all recipes with actual names
SELECT 
    pr."PillId",
    p."Name" as pill_name,
    pr."HerbId",
    h."Name" as herb_name,
    pr."Quantity"
FROM "PillRecipes" pr
JOIN "Items" p ON pr."PillId" = p."Id"
JOIN "Items" h ON pr."HerbId" = h."Id"
ORDER BY pr."PillId", pr."Quantity" DESC;
