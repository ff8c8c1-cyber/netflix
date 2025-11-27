-- ============================================
-- MARKET ITEMS SEED DATA
-- Add items to populate the Market page
-- ============================================

-- Clear existing test items if needed (optional, comment out if you want to keep existing)
-- DELETE FROM "Items" WHERE "Id" BETWEEN 1 AND 20;

-- EXP Pills (Type: pill_exp for market category 'consumable')
INSERT INTO "Items" ("Name", "Description", "Type", "Price", "IconUrl", "Effect", "Rarity")
VALUES
    ('Tiểu Hoàn Đan', 'Tăng 100 EXP tu luyện cơ bản', 'pill_exp', 50, '💊', '100', 'common'),
    ('Trung Hoàn Đan', 'Tăng 500 EXP tu luyện trung cấp', 'pill_exp', 200, '🔮', '500', 'uncommon'),
    ('Đại Hoàn Đan', 'Tăng 2000 EXP tu luyện cao cấp', 'pill_exp', 1000, '💎', '2000', 'rare')
ON CONFLICT ("Id") DO NOTHING;

-- Buff Pills (ATK)
INSERT INTO "Items" ("Name", "Description", "Type", "Price", "IconUrl", "Effect", "Rarity")
VALUES
    ('Liệt Hỏa Đan', 'Tăng 20% ATK trong 30 phút', 'pill_atk', 150, '🔥', '20', 'uncommon'),
    ('Cuồng Bạo Đan', 'Tăng 50% ATK trong 30 phút', 'pill_atk', 500, '⚔️', '50', 'rare')
ON CONFLICT ("Id") DO NOTHING;

-- Buff Pills (DEF)
INSERT INTO "Items" ("Name", "Description", "Type", "Price", "IconUrl", "Effect", "Rarity")
VALUES
    ('Kim Cang Đan', 'Tăng 20% DEF trong 30 phút', 'pill_def', 150, '🛡️', '20', 'uncommon'),
    ('Bất Hoại Đan', 'Tăng 50% DEF trong 30 phút', 'pill_def', 500, '💫', '50', 'rare')
ON CONFLICT ("Id") DO NOTHING;

-- Buff Pills (HP)
INSERT INTO "Items" ("Name", "Description", "Type", "Price", "IconUrl", "Effect", "Rarity")
VALUES
    ('Hồi Xuân Đan', 'Tăng 20% HP tối đa trong 30 phút', 'pill_hp', 150, '❤️', '20', 'uncommon'),
    ('Trường Sinh Đan', 'Tăng 50% HP tối đa trong 30 phút', 'pill_hp', 500, '💚', '50', 'rare')
ON CONFLICT ("Id") DO NOTHING;

-- Buff Pills (SPD)
INSERT INTO "Items" ("Name", "Description", "Type", "Price", "IconUrl", "Effect", "Rarity")
VALUES
    ('Thần Hành Đan', 'Tăng 20% SPD trong 30 phút', 'pill_spd', 150, '⚡', '20', 'uncommon'),
    ('Lôi Tốc Đan', 'Tăng 50% SPD trong 30 phút', 'pill_spd', 500, '🌪️', '50', 'rare')
ON CONFLICT ("Id") DO NOTHING;

-- Special Items (Type: special)
INSERT INTO "Items" ("Name", "Description", "Type", "Price", "IconUrl", "Effect", "Rarity")
VALUES
    ('Tẩy Tủy Đan', 'Reset toàn bộ tu vi để tái tu luyện', 'special', 5000, '🌟', 'reset_rank', 'legendary'),
    ('Thiên Mệnh Bùa', 'Tăng may mắn khi breakthrough', 'special', 2000, '✨', 'luck_boost', 'epic')
ON CONFLICT ("Id") DO NOTHING;

-- Equipment Items (Type: equipment) 
INSERT INTO "Items" ("Name", "Description", "Type", "Price", "IconUrl", "Effect", "Rarity")
VALUES
    ('Thần Kiếm', 'Kiếm pháp bảo cấp thấp +10 ATK', 'equipment', 1000, '⚔️', 'atk+10', 'rare'),
    ('Long Giáp', 'Giáp long lân +15 DEF', 'equipment', 1200, '🛡️', 'def+15', 'rare')
ON CONFLICT ("Id") DO NOTHING;

-- ============================================
-- VERIFICATION QUERY
-- Run this to check if items were added successfully
-- ============================================
-- SELECT "Id", "Name", "Type", "Price", "IconUrl" FROM "Items" ORDER BY "Type", "Price";
