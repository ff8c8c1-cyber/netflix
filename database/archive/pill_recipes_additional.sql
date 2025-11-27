-- =============================================
-- ADDITIONAL PILL RECIPES
-- Based on existing herbs and pills from add_pills_herbs_supabase.sql
-- =============================================

-- This script adds recipes for common pills using the herbs already in database
-- Run this AFTER running add_pills_herbs_supabase.sql

-- =============================================
-- Common Pills (Phàm Cấp) - Using Common Herbs
-- =============================================

-- Tụ Khí Tán (already exists in main file)
-- Recipe: Linh Sâm x3 + Cam Thảo x2 + Kim Ngân Hoa x1

-- Bồi Nguyên Đan
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
    v_herb3_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Bồi Nguyên Đan' AND "Type" = 'pill_exp' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Hoàng Kỳ' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Đương Quy' LIMIT 1;
    SELECT "Id" INTO v_herb3_id FROM "Items" WHERE "Name" = 'Linh Sâm' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 4),
        (v_pill_id, v_herb2_id, 3),
        (v_pill_id, v_herb3_id, 2);
        
        RAISE NOTICE 'Recipe for Bồi Nguyên Đan created';
    END IF;
END $$;

-- Thiên Nguyên Đan
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Thiên Nguyên Đan' AND "Type" = 'pill_exp' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Phục Linh' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Bạch Linh Chi' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 5),
        (v_pill_id, v_herb2_id, 2);
        
        RAISE NOTICE 'Recipe for Thiên Nguyên Đan created';
    END IF;
END $$;

-- =============================================
-- Rare Pills (Linh Cấp) - Using Rare Herbs
-- =============================================

-- Cửu Chuyển Kim Đan
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
    v_herb3_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Cửu Chuyển Kim Đan' AND "Type" = 'pill_exp' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Thiên Sơn Tuyết Liên' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Vạn Niên Linh Chi' LIMIT 1;
    SELECT "Id" INTO v_herb3_id FROM "Items" WHERE "Name" = 'Ngọc Linh Sâm' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 3),
        (v_pill_id, v_herb2_id, 2),
        (v_pill_id, v_herb3_id, 2);
        
        RAISE NOTICE 'Recipe for Cửu Chuyển Kim Đan created';
    END IF;
END $$;

-- Địa Linh Đan
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Địa Linh Đan' AND "Type" = 'pill_exp' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Băng Hồn Thảo' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Lục Ngọc San Hô' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 4),
        (v_pill_id, v_herb2_id, 3);
        
        RAISE NOTICE 'Recipe for Địa Linh Đan created';
    END IF;
END $$;

-- =============================================
-- Buff Pills - ATK
-- =============================================

-- Bạo Lực Đan (Common ATK)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Bạo Lực Đan' AND "Type" = 'pill_atk' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Ô Đầu' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Xuyên Khung' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 3),
        (v_pill_id, v_herb2_id, 2);
        
        RAISE NOTICE 'Recipe for Bạo Lực Đan created';
    END IF;
END $$;

-- Hổ Bôn Lôi Âm Đan (Uncommon ATK)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Hổ Bôn Lôi Âm Đan' AND "Type" = 'pill_atk' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Thiên Lôi Trúc' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Huyết Long Quả' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 2),
        (v_pill_id, v_herb2_id, 2);
        
        RAISE NOTICE 'Recipe for Hổ Bôn Lôi Âm Đan created';
    END IF;
END $$;

-- Phá Thiên Nhất Kích Đan (Rare ATK)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
    v_herb3_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Phá Thiên Nhất Kích Đan' AND "Type" = 'pill_atk' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Lôi Kích Mộc' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Huyền Thiên Linh Thạch' LIMIT 1;
    SELECT "Id" INTO v_herb3_id FROM "Items" WHERE "Name" = 'Huyết Long Quả' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 2),
        (v_pill_id, v_herb2_id, 1),
        (v_pill_id, v_herb3_id, 2);
        
        RAISE NOTICE 'Recipe for Phá Thiên Nhất Kích Đan created';
    END IF;
END $$;

-- =============================================
-- Buff Pills - DEF
-- =============================================

-- Kim Cang Đan (Common DEF)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Kim Cang Đan' AND "Type" = 'pill_def' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Bạch Truật' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Địa Hoàng' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 3),
        (v_pill_id, v_herb2_id, 2);
        
        RAISE NOTICE 'Recipe for Kim Cang Đan created';
    END IF;
END $$;

-- Bất Hoại Chi Thân Đan (Rare DEF)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Bất Hoại Chi Thân Đan' AND "Type" = 'pill_def' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Thiết Bì Anh' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Kim Cương Bồ Đề Tử' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 3),
        (v_pill_id, v_herb2_id, 1);
        
        RAISE NOTICE 'Recipe for Bất Hoại Chi Thân Đan created';
    END IF;
END $$;

-- =============================================
-- Buff Pills - SPD
-- =============================================

-- Thần Hành Đan (Common SPD)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Thần Hành Đan' AND "Type" = 'pill_spd' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Phong Linh Hoa' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 3);
        
        RAISE NOTICE 'Recipe for Thần Hành Đan created';
    END IF;
END $$;

-- Lưu Tinh Tốc Đan (Rare SPD)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Lưu Tinh Tốc Đan' AND "Type" = 'pill_spd' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Phong Linh Hoa' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Tinh Vân Thảo' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 4),
        (v_pill_id, v_herb2_id, 2);
        
        RAISE NOTICE 'Recipe for Lưu Tinh Tốc Đan created';
    END IF;
END $$;

-- =============================================
-- HP Pills
-- =============================================

-- Hoạt Huyết Đan (Common HP)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Hoạt Huyết Đan' AND "Type" = 'pill_hp' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Hà Thủ Ô' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Kỳ Lân Thảo' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 2),
        (v_pill_id, v_herb2_id, 3);
        
        RAISE NOTICE 'Recipe for Hoạt Huyết Đan created';
    END IF;
END $$;

-- Đại Hoàn Đan (Uncommon HP)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Đại Hoàn Đan' AND "Type" = 'pill_hp' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Thiên Tầm Tơ' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Thủy Tinh Liên' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 2),
        (v_pill_id, v_herb2_id, 2);
        
        RAISE NOTICE 'Recipe for Đại Hoàn Đan created';
    END IF;
END $$;

-- Tái Tạo Đan (Rare HP)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Tái Tạo Đan' AND "Type" = 'pill_hp' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Hồn Phách Hoa' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Ngũ Sắc Thần Chi' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 1),
        (v_pill_id, v_herb2_id, 2);
        
        RAISE NOTICE 'Recipe for Tái Tạo Đan created';
    END IF;
END $$;

-- =============================================
-- ALL Stats Pills
-- =============================================

-- Tam Hoa Tụ Đỉnh Đan (Rare ALL)
DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
    v_herb3_id INTEGER;
BEGIN
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Tam Hoa Tụ Đỉnh Đan' AND "Type" = 'pill_all' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Ngũ Sắc Thần Chi' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Âm Dương Huyền Quả' LIMIT 1;
    SELECT "Id" INTO v_herb3_id FROM "Items" WHERE "Name" = 'Hỏa Linh Chi' LIMIT 1;
    
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        DELETE FROM "PillRecipes" WHERE "PillId" = v_pill_id;
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 2),
        (v_pill_id, v_herb2_id, 1),
        (v_pill_id, v_herb3_id, 2);
        
        RAISE NOTICE 'Recipe for Tam Hoa Tụ Đỉnh Đan created';
    END IF;
END $$;

-- =============================================
-- VERIFICATION
-- =============================================

-- Count total recipes
SELECT 
    'Total Recipes' as info,
    COUNT(*) as count 
FROM "PillRecipes";

-- Show all recipes with pill and herb names
SELECT 
    p."Name" as pill_name,
    p."Type" as pill_type,
    h."Name" as herb_name,
    r."Quantity" as quantity
FROM "PillRecipes" r
JOIN "Items" p ON r."PillId" = p."Id"
JOIN "Items" h ON r."HerbId" = h."Id"
ORDER BY p."Name", r."Quantity" DESC;
