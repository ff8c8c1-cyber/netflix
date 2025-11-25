-- 1. Create Items Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Items')
BEGIN
    CREATE TABLE Items (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Type NVARCHAR(50) NOT NULL, -- 'Resource', 'Consumable', 'Material', 'Token'
        Rarity NVARCHAR(20) DEFAULT 'Common', -- 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'
        Description NVARCHAR(500),
        Effect NVARCHAR(MAX), -- e.g. {"type": "exp", "value": 1000} or {"type": "buff", "stat": "atk", "value": 10}
        Price INT DEFAULT 0 -- Base price in Spirit Stones
    );
END

-- 2. Create Inventory Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Inventory')
BEGIN
    CREATE TABLE Inventory (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        ItemId INT NOT NULL,
        Quantity INT DEFAULT 1,
        FOREIGN KEY (UserId) REFERENCES Users(Id),
        FOREIGN KEY (ItemId) REFERENCES Items(Id)
    );
END

-- 3. Create SectShopItems Table (Exchange Store)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SectShopItems')
BEGIN
    CREATE TABLE SectShopItems (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        SectId INT NULL, -- NULL = Global Sect Shop (available to all sects), Specific ID = Unique to that sect
        ItemId INT NOT NULL,
        CostContribution INT NOT NULL,
        ReqRole NVARCHAR(50) DEFAULT 'Outer', -- 'Outer', 'Inner', 'Core', 'Elder', 'Leader'
        Stock INT DEFAULT -1, -- -1 = Infinite
        FOREIGN KEY (ItemId) REFERENCES Items(Id)
    );
END

-- 4. Seed Real Data (Items)
-- Clear existing items to avoid duplicates if re-running (optional, but safer for dev)
TRUNCATE TABLE SectShopItems;
DELETE FROM Items; 
DBCC CHECKIDENT ('Items', RESEED, 0);

INSERT INTO Items (Name, Type, Rarity, Description, Effect, Price) VALUES 
-- Resources
(N'Linh Thạch Hạ Phẩm', 'Resource', 'Common', N'Đơn vị tiền tệ cơ bản của giới tu chân, chứa linh khí ít ỏi.', '{"type": "currency", "value": 1}', 1),
(N'Linh Thạch Trung Phẩm', 'Resource', 'Uncommon', N'Linh thạch chứa lượng linh khí tinh thuần, dùng cho tu luyện.', '{"type": "currency", "value": 100}', 100),
(N'Gỗ Thiết Mộc', 'Material', 'Common', N'Gỗ cứng như sắt, dùng để xây dựng kiến trúc tông môn.', NULL, 10),
(N'Huyền Thiết', 'Material', 'Uncommon', N'Kim loại quý dùng để rèn binh khí và nâng cấp đại điện.', NULL, 50),

-- Consumables (Pills)
(N'Tụ Khí Đan', 'Consumable', 'Common', N'Đan dược sơ cấp, giúp tăng tốc độ tu luyện trong thời gian ngắn.', '{"type": "exp", "value": 500}', 50),
(N'Trúc Cơ Đan', 'Consumable', 'Rare', N'Đan dược quý giá, hỗ trợ đột phá cảnh giới Trúc Cơ.', '{"type": "breakthrough", "chance": 20}', 2000),
(N'Hồi Huyết Đan', 'Consumable', 'Common', N'Hồi phục vết thương nhẹ ngay lập tức.', '{"type": "heal", "value": 50}', 20),

-- Tokens/Tools
(N'Lệnh Bài Ngoại Môn', 'Token', 'Common', N'Chứng nhận thân phận đệ tử ngoại môn.', NULL, 0),
(N'Lệnh Bài Nội Môn', 'Token', 'Uncommon', N'Chứng nhận thân phận đệ tử nội môn, được vào Tàng Kinh Các tầng 2.', NULL, 0),
(N'Bí Kíp: Hỏa Cầu Thuật', 'Consumable', 'Uncommon', N'Sách kỹ năng cơ bản hệ Hỏa.', '{"type": "skill", "id": "fireball"}', 500);

-- 5. Seed Sect Shop (Global Items available to all Sects)
INSERT INTO SectShopItems (SectId, ItemId, CostContribution, ReqRole, Stock) VALUES 
-- Basic Resources
(NULL, 1, 10, 'Outer', -1), -- Linh Thạch Hạ Phẩm (Cost 10 Contribution)
(NULL, 3, 5, 'Outer', -1), -- Gỗ Thiết Mộc
(NULL, 5, 100, 'Outer', -1), -- Tụ Khí Đan

-- Advanced Items
(NULL, 2, 1000, 'Inner', -1), -- Linh Thạch Trung Phẩm
(NULL, 4, 500, 'Inner', -1), -- Huyền Thiết
(NULL, 7, 50, 'Outer', -1), -- Hồi Huyết Đan

-- Rare Items
(NULL, 6, 5000, 'Core', 10), -- Trúc Cơ Đan (Limited Stock)
(NULL, 10, 2000, 'Inner', -1); -- Bí Kíp Hỏa Cầu Thuật

-- 6. Update SectBuildings to include Upgrade Requirements (Adding Columns)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SectBuildings') AND name = 'UpgradeMaterials')
BEGIN
    ALTER TABLE SectBuildings ADD UpgradeMaterials NVARCHAR(MAX); -- JSON string e.g. {"itemId": 3, "count": 100}
END

-- Update Building Requirements (Example)
-- Main Hall Lv1 -> Lv2: Needs 100 Wood (Id 3)
UPDATE SectBuildings SET UpgradeMaterials = '{"3": 100}' WHERE Type = 'MainHall' AND Level = 1;
-- Pavilion Lv1 -> Lv2: Needs 50 Wood (Id 3) + 10 Iron (Id 4)
UPDATE SectBuildings SET UpgradeMaterials = '{"3": 50, "4": 10}' WHERE Type = 'Pavilion' AND Level = 1;

