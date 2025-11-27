-- =============================================
-- PILLS & HERBS MIGRATION - SUPABASE/POSTGRESQL
-- Based on: authentic_alchemy_system.md
-- =============================================
-- This script populates:
-- - 45 Pills (Đan Dược) across 5 tiers
-- - 45 Herbs (Dược Liệu) - essential herbs only
-- - PillRecipes table with crafting formulas
-- =============================================

-- =============================================
-- STEP 1: Add Missing Columns to Items Table
-- =============================================
-- First, check and add missing columns to Items table
ALTER TABLE "Items" ADD COLUMN IF NOT EXISTS "Rarity" VARCHAR(20) DEFAULT 'common';
ALTER TABLE "Items" ADD COLUMN IF NOT EXISTS "Effect" TEXT;
ALTER TABLE "Items" ADD COLUMN IF NOT EXISTS "Description" TEXT;
ALTER TABLE "Items" ADD COLUMN IF NOT EXISTS "IconUrl" TEXT;

-- =============================================
-- STEP 2: Create PillRecipes Table
-- =============================================
CREATE TABLE IF NOT EXISTS "PillRecipes" (
    "Id" SERIAL PRIMARY KEY,
    "PillId" INTEGER NOT NULL,
    "HerbId" INTEGER NOT NULL,
    "Quantity" INTEGER DEFAULT 1,
    FOREIGN KEY ("PillId") REFERENCES "Items"("Id"),
    FOREIGN KEY ("HerbId") REFERENCES "Items"("Id")
);

-- =============================================
-- STEP 3: Clear Existing Pills & Herbs Data
-- =============================================
-- Delete old pills and herbs to avoid duplicate key errors
-- Note: PillRecipes must be cleared first due to foreign key constraints
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'PillRecipes') THEN
        DELETE FROM "PillRecipes";
    END IF;
END $$;

DELETE FROM "Items" WHERE "Type" = 'herb';
DELETE FROM "Items" WHERE "Type" LIKE 'pill_%';

-- =============================================
-- STEP 4: Insert HERBS (45 essential herbs)
-- =============================================

-- PHÀM CẤP HERBS (15 items) - Common tier
INSERT INTO "Items" ("Name", "Type", "Rarity", "Description", "Price") VALUES
('Cam Thảo', 'herb', 'common', 'Bách dược chi vương, giải độc hòa trung', 5),
('Linh Sâm', 'herb', 'common', 'Bồi bổ nguyên khí, tăng cường thể lực', 8),
('Kim Ngân Hoa', 'herb', 'common', 'Giải độc thanh nhiệt, trị cảm mạo', 10),
('Hà Thủ Ô', 'herb', 'common', 'Bổ huyết dưỡng nhan, ích thọ trường sinh', 12),
('Kỳ Lân Thảo', 'herb', 'common', 'Chữa thương liền da, hoạt huyết sinh cơ', 15),
('Bạch Truật', 'herb', 'common', 'Kiện tỳ ích khí, táo thấp lợi thủy', 18),
('Đương Quy', 'herb', 'common', 'Bổ huyết hoạt huyết, điều kinh chỉ thống', 20),
('Hoàng Kỳ', 'herb', 'common', 'Ích khí thăng dương, cố biểu chỉ hãn', 22),
('Bạch Chỉ', 'herb', 'common', 'Tán phong chỉ thống, táo thấp thông tý', 14),
('Trần Bì', 'herb', 'common', 'Lý khí tiêu đàm, kiện tỳ hòa vị', 10),
('Địa Hoàng', 'herb', 'common', 'Bổ huyết tư âm, thanh nhiệt lương huyết', 25),
('Xuyên Khung', 'herb', 'common', 'Hoạt huyết chỉ thống, khứ phong thông lạc', 16),
('Phục Linh', 'herb', 'common', 'An thần lợi thủy, kiện tỳ hòa vị', 18),
('Bạch Linh Chi', 'herb', 'common', 'An thần tăng thọ, ích khí dưỡng tâm', 30),
('Ô Đầu', 'herb', 'common', 'Tăng lực mạnh khí, độc tính cao', 28);

-- LINH CẤP HERBS (15 items) - Uncommon/Rare tier
INSERT INTO "Items" ("Name", "Type", "Rarity", "Description", "Price") VALUES
('Thiên Sơn Tuyết Liên', 'herb', 'rare', 'Thiên hạ đệ nhất linh hoa, ngàn năm mới nở', 50),
('Vạn Niên Linh Chi', 'herb', 'rare', 'Thần dược chi tối, vạn niên thiên thành', 80),
('Băng Hồn Thảo', 'herb', 'rare', 'Thanh tâm minh từ, dưỡng hồn bồi phách', 60),
('Lục Ngọc San Hô', 'herb', 'rare', 'Biển cả trân kỳ, linh khí tinh thuần', 70),
('Hỏa Linh Chi', 'herb', 'rare', 'Dương cương chi cực, hỏa hệ tối cường', 75),
('Thủy Tinh Liên', 'herb', 'rare', 'Liên hoa tịnh thế, thanh nhất ninh thần', 65),
('Thiên Lôi Trúc', 'herb', 'rare', 'Lôi đánh thành linh, khử tà trừ ma', 90),
('Ngọc Linh Sâm', 'herb', 'rare', 'Ngọc sâm bách tuổi, bồi bổ cực đại', 100),
('Thiết Bì Anh', 'herb', 'rare', 'Kiên cường bất khuất, phòng thủ vô song', 55),
('Phong Linh Hoa', 'herb', 'rare', 'Tốc như phong điện, thân pháp huyền diệu', 85),
('Nguyệt Hoa', 'herb', 'rare', 'Âm dương hòa hợp, nghe nguyệt linh thông', 95),
('Tinh Vân Thảo', 'herb', 'rare', 'Ngộ đạo tức thời, trí tuệ khai mở', 88),
('Linh Hồ Tử', 'herb', 'rare', 'Cửu vĩ di chủng, linh dị phi thường', 78),
('Huyết Long Quả', 'herb', 'rare', 'Long mạch truyền thừa, lực mạnh vô song', 120),
('Thiên Tầm Tơ', 'herb', 'rare', 'Hàn gắn vô song, tái tạo huyết nhục', 110);

-- ĐỊA CẤP HERBS (10 items) - Epic tier  
INSERT INTO "Items" ("Name", "Type", "Rarity", "Description", "Price") VALUES
('Cửu Khiếu Hồ Du Quả', 'herb', 'epic', 'Thiên địa tạo hóa, linh dược cực phẩm', 200),
('Địa Linh Nhũ', 'herb', 'epic', 'Vạn niên nhất giọt, tinh hoa địa mạch', 300),
('Huyết Ngọc San Hô', 'herb', 'epic', 'Biển cả trân bảo, huyết khí dược vương', 250),
('Băng Phách', 'herb', 'epic', 'Thời gian đóng băng, vạn niên tinh hoa', 280),
('Lôi Kích Mộc', 'herb', 'epic', 'Lôi kích thành thần, thiên lôi chi lực', 220),
('Kim Cương Bồ Đề Tử', 'herb', 'epic', 'Bồ đề tử quý, khai trí minh tâm', 350),
('Huyền Thiên Linh Thạch', 'herb', 'epic', 'Thiên ngoại phi thạch, chứa năng lượng vũ trụ', 320),
('Ngũ Sắc Thần Chi', 'herb', 'epic', 'Ngũ hành toàn mỹ, âm dương hòa hợp', 400),
('Âm Dương Huyền Quả', 'herb', 'epic', 'Hòa hợp tự nhiên, điều tiết âm dương', 420),
('Hồn Phách Hoa', 'herb', 'epic', 'Sinh tử luân hồi, hoàn hồn tái tạo', 520);

-- THIÊN CẤP HERBS (5 items) - Legendary tier
INSERT INTO "Items" ("Name", "Type", "Rarity", "Description", "Price") VALUES
('Thái Cổ Long Đản', 'herb', 'legendary', 'Long tộc truyền nhân, chứa huyết mạch thần long', 1000),
('Phượng Hoàng Đản', 'herb', 'legendary', 'Niết bàn chi lực, phượng hoàng tái sinh', 1200),
('Thần Mộc Vương Thụ Tâm', 'herb', 'legendary', 'Sinh mệnh cội nguồn, vạn mộc chi vương', 1500),
('Băng Hỏa Song Liên', 'herb', 'legendary', 'Cực đoan hòa hợp, băng hỏa giao dung', 1800),
('Vô Cực Thần Tinh', 'herb', 'legendary', 'Vô biên năng lượng, vũ trụ tinh hoa', 2500);

-- =============================================
-- STEP 5: Insert PILLS (45 total)
-- =============================================

-- A. ĐAN TU LUYỆN (10 pills) - EXP type
INSERT INTO "Items" ("Name", "Type", "Rarity", "Description", "Effect", "Price") VALUES
('Tụ Khí Tán', 'pill_exp', 'common', 'Đan phẩm cơ bản, tu sĩ tân thủ. Tụ khí thiên địa, nhập thân thành lực', '500', 100),
('Bồi Nguyên Đan', 'pill_exp', 'uncommon', 'Bồi bổ nguyên khí, cảnh giới tăng trưởng', '2000', 300),
('Cửu Chuyển Kim Đan', 'pill_exp', 'rare', 'Cửu chuyển luyện đan, kim đan đại thành', '10000', 1500),
('Hóa Long Đan', 'pill_exp', 'epic', 'Hóa phàm thành long, vượt phàm nhập thánh', '50000', 8000),
('Hồng Mông Tử Kim Đan', 'pill_exp', 'legendary', 'Hồng mông sơ khai, tử khí hoà kim. Unlock hidden potential', '200000', 50000),
('Thiên Nguyên Đan', 'pill_exp', 'uncommon', 'Hấp thu thiên địa chi lực', '2500', 400),
('Địa Linh Đan', 'pill_exp', 'rare', 'Đại địa tinh hoa, đan thành phá cảnh', '5000', 800),
('Thiên Vương Bảo Đan', 'pill_exp', 'epic', 'Thiên vương trấn thế, bảo đan vô song', '30000', 5000),
('Phá Thiên Đan', 'pill_exp', 'legendary', 'Phá thiên khai địa, vạn pháp quy tông', '250000', 40000),
('Thái Cổ Kim Đan', 'pill_exp', 'legendary', 'Thái cổ chi đan, thượng cổ đệ nhất. +10 all stats vĩnh viễn', '300000', 60000);

-- B. ĐAN ĐỘT PHÁ (10 pills) - Breakthrough type
INSERT INTO "Items" ("Name", "Type", "Rarity", "Description", "Effect", "Price") VALUES
('Trúc Cơ Đan', 'pill_breakthrough', 'common', 'Phàm giai trúc cơ, tu tiên chi nền. +15% breakthrough rate', '15', 200),
('Kết Đan Bảo Lộ', 'pill_breakthrough', 'uncommon', 'Kết đan bảo vật nan cầu. +25% breakthrough rate', '25', 500),
('Ngưng Anh Đan', 'pill_breakthrough', 'rare', 'Nguyên anh ngưng tụ, đại đạo khả kỳ. +45% breakthrough rate', '45', 2000),
('Hóa Thần Thánh Đan', 'pill_breakthrough', 'epic', 'Hóa thần chi cảnh, thánh giả độc tôn. +70% breakthrough rate', '70', 6000),
('Thành Tiên Đại Hoàn Đan', 'pill_breakthrough', 'legendary', 'Thành tiên đại hoàn, phi thăng tại tức. +95% breakthrough rate', '95', 50000),
('Khai Mạch Đan', 'pill_breakthrough', 'common', 'Thông kinh hoạt lạc, khai mở huyệt đạo. +15% breakthrough rate', '15', 250),
('Thông Tấn Hoàn', 'pill_breakthrough', 'uncommon', 'Thông thiên tri kế, vượt cảnh như phi. +30% breakthrough rate', '30', 800),
('Huyền Linh Bảo Lộ', 'pill_breakthrough', 'rare', 'Huyền chi hựu huyền, bảo lộ thiên thành. +50% breakthrough rate', '50', 3000),
('Luyện Hư Bất Hoại Đan', 'pill_breakthrough', 'epic', 'Luyện hư hoàn đạo, bất hoại kim thân. +75% breakthrough rate', '75', 12000),
('Nhất Khí Hóa Tam Thanh Đan', 'pill_breakthrough', 'legendary', 'Nhất khí hóa tam thanh, đốn ngộ đại đạo. Double breakthrough (skip 1 rank)', '85', 100000);

-- C. ĐAN HỒI PHỤC (8 pills) - HP type
INSERT INTO "Items" ("Name", "Type", "Rarity", "Description", "Effect", "Price") VALUES
('Hoạt Huyết Đan', 'pill_hp', 'common', 'Hoạt huyết hóa ứ, thương khẩu mau lành. +1000 HP, xóa poison/bleed', '1000', 80),
('Đại Hoàn Đan', 'pill_hp', 'uncommon', 'Đại hoàn hoàn nguyên, hồi phục tức thời. +3000 HP instant', '3000', 150),
('Tái Tạo Đan', 'pill_hp', 'rare', 'Tái tạo chi ân, như đắc tân sinh. Full HP+MP restore', 'full', 800),
('Cửu Chuyển Hoàn Hồn Đan', 'pill_hp', 'epic', 'Cửu chuyển hoàn hồn, địa ngục hoàn dương. Revive với 70% HP', '70', 3000),
('Niết Bàn Trùng Sinh Đan', 'pill_hp', 'legendary', 'Niết bàn trùng sinh, hỏa phượng hoàn sinh. Full heal + invincible 1 min', 'full', 20000),
('Thiên Linh Đan', 'pill_hp', 'uncommon', 'Thiên linh hộ thể, sinh sinh bất tức. +100 HP/sec trong 30s', '100', 200),
('Bất Tử Kim Thân Đan', 'pill_hp', 'rare', 'Kim thân bất hoại, thần hồn bất diệt. Invincible 10 giây', '10', 1500),
('Thái Ất Vân Sinh Đan', 'pill_hp', 'epic', 'Thái ất vân sinh, sinh sinh hóa hóa. +300 HP/sec 120s', '300', 5000);

-- D. ĐAN BUFF (9 pills) - ATK/DEF/SPD/ALL types
INSERT INTO "Items" ("Name", "Type", "Rarity", "Description", "Effect", "Price") VALUES
-- ATK Pills
('Bạo Lực Đan', 'pill_atk', 'common', 'Bạo phát tùng lực, nhất kích tất sát. +30% ATK 1 giờ', '30', 150),
('Hổ Bôn Lôi Âm Đan', 'pill_atk', 'uncommon', 'Hổ khiếu sơn lâm, lôi động cửu thiên. +60% ATK 2 giờ', '60', 400),
('Phá Thiên Nhất Kích Đan', 'pill_atk', 'rare', 'Nhất kích phá thiên, oai lực vô biên. +120% ATK 3 giờ, +15% crit', '120', 1200),
-- DEF Pills
('Kim Cang Đan', 'pill_def', 'common', 'Kim cang bất hoại, vạn pháp bất xâm. +30% DEF 1 giờ', '30', 150),
('Bất Hoại Chi Thân Đan', 'pill_def', 'rare', 'Thân bất hoại, tâm bất động. +100% DEF 3 giờ, reflect 10% damage', '100', 1000),
-- SPD Pills
('Thần Hành Đan', 'pill_spd', 'common', 'Thần hành thái bảo, bất kiến kỳ hình. +30% SPD 1 giờ', '30', 150),
('Lưu Tinh Tốc Đan', 'pill_spd', 'rare', 'Tốc như lưu tinh, điện quang hỏa thạch. +100% SPD 3 giờ', '100', 1000),
-- ALL Stats Pills
('Tam Hoa Tụ Đỉnh Đan', 'pill_all', 'rare', 'Tam hoa tụ đỉnh, ngũ khí triều nguyên. +40% all stats 3 giờ', '40', 2000),
('Thái Cực Vô Cực Đan', 'pill_all', 'epic', 'Thái cực vô cực, vạn pháp quy nhất. +80% all stats 6 giờ', '80', 8000);

-- E. ĐAN ĐẶC BIỆT (8 pills) - Special type
INSERT INTO "Items" ("Name", "Type", "Rarity", "Description", "Effect", "Price") VALUES
('Tẩy Tủy Kinh Đan', 'pill_special', 'epic', 'Tẩy tủy phạt cốt, đổi hoán căn cơ. Reset rank, keep EXP', 'reset', 5000),
('Ngũ Hành Chuyển Hoán Đan', 'pill_special', 'rare', 'Ngũ hành tương sinh, chuyển hoán tự tại. Change element', 'element', 3000),
('Hồi Thiên Đại Pháp Đan', 'pill_special', 'legendary', 'Hồi thiên đại pháp, sinh tử vô ưu. Revive after death (PvP)', 'revive', 20000),
('Thời Gian Đảo Ngược Đan', 'pill_special', 'legendary', 'Thời gian đảo ngược, vạn sự khả hồi. Restore state 1 hour ago', 'time', 50000),
('Đoạt Thiên Tạo Hóa Đan', 'pill_special', 'epic', 'Đoạt thiên địa tạo hóa, linh lực đại tăng. +1 skill point', 'skill', 4000),
('Thiên Cơ Giải Mật Đan', 'pill_special', 'epic', 'Thiên cơ khả giải, ẩn mật tận hiện. Reveal hidden quests', 'reveal', 6000),
('Âm Dương Hòa Hợp Đan', 'pill_special', 'rare', 'Âm dương điều hòa, vạn pháp quy nhất. Rebalance stats', 'rebalance', 5000),
('Hoán Cốt Đoạt Thai Đan', 'pill_special', 'legendary', 'Hoán cốt đoạt thai, thâu nhân vi dụng. Swap stats với target (PvP)', 'swap', 30000);

-- =============================================
-- STEP 6: Insert SAMPLE PILL RECIPES
-- =============================================
-- Example: Tụ Khí Tán = Linh Sâm x3 + Cam Thảo x2 + Kim Ngân Hoa x1

DO $$
DECLARE
    v_pill_id INTEGER;
    v_herb1_id INTEGER;
    v_herb2_id INTEGER;
    v_herb3_id INTEGER;
BEGIN
    -- Get IDs
    SELECT "Id" INTO v_pill_id FROM "Items" WHERE "Name" = 'Tụ Khí Tán' LIMIT 1;
    SELECT "Id" INTO v_herb1_id FROM "Items" WHERE "Name" = 'Linh Sâm' LIMIT 1;
    SELECT "Id" INTO v_herb2_id FROM "Items" WHERE "Name" = 'Cam Thảo' LIMIT 1;
    SELECT "Id" INTO v_herb3_id FROM "Items" WHERE "Name" = 'Kim Ngân Hoa' LIMIT 1;
    
    -- Insert recipe if all items exist
    IF v_pill_id IS NOT NULL AND v_herb1_id IS NOT NULL THEN
        INSERT INTO "PillRecipes" ("PillId", "HerbId", "Quantity") VALUES
        (v_pill_id, v_herb1_id, 3),
        (v_pill_id, v_herb2_id, 2),
        (v_pill_id, v_herb3_id, 1);
        
        RAISE NOTICE 'Recipe for Tụ Khí Tán created successfully';
    END IF;
END $$;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Count pills by type
SELECT 
    'Pills' as category,
    "Type",
    COUNT(*) as count
FROM "Items" 
WHERE "Type" LIKE 'pill_%'
GROUP BY "Type"
ORDER BY "Type";

-- Count herbs
SELECT 'Herbs' as category, COUNT(*) as count 
FROM "Items" WHERE "Type" = 'herb';

-- Count recipes
SELECT 'Recipes' as category, COUNT(*) as count 
FROM "PillRecipes";

-- Sample pills
SELECT "Name", "Type", "Rarity", "Price" 
FROM "Items" 
WHERE "Type" LIKE 'pill_%'
ORDER BY "Price" ASC
LIMIT 10;
