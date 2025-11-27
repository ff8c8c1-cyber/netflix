-- Create Auctions table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auctions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Auctions](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [ItemId] [int] NOT NULL, -- Refers to Items table
        [SellerId] [int] NULL, -- NULL if system auction
        [StartPrice] [int] NOT NULL,
        [CurrentBid] [int] NOT NULL,
        [HighestBidderId] [int] NULL,
        [EndTime] [datetime] NOT NULL,
        [IsClosed] [bit] DEFAULT 0,
        PRIMARY KEY CLUSTERED ([Id] ASC)
    )
END

-- Create BlackMarketItems table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BlackMarketItems]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[BlackMarketItems](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [ItemId] [int] NOT NULL,
        [Price] [int] NOT NULL,
        [Stock] [int] NOT NULL,
        [RefreshTime] [datetime] DEFAULT GETDATE(),
        PRIMARY KEY CLUSTERED ([Id] ASC)
    )
END

-- Seed Initial Black Market Items (Rare items)
IF NOT EXISTS (SELECT * FROM BlackMarketItems)
BEGIN
    -- Assuming ItemId 1 is 'Linh Thạch' (Currency), let's use other IDs or placeholders.
    -- We need to ensure these ItemIds exist in Items table. 
    -- For now, let's assume we have some rare items seeded previously or we'll insert them if missing.
    
    -- Insert some rare items into Items if they don't exist (Safe check)
    IF NOT EXISTS (SELECT * FROM Items WHERE Name = N'Huyết Long Đan')
        INSERT INTO Items (Name, Type, Description, Rarity, Effect) VALUES (N'Huyết Long Đan', 'Consumable', N'Tăng mạnh khí huyết và công lực.', 'Legendary', '{"hp": 500, "exp": 1000}')
        
    IF NOT EXISTS (SELECT * FROM Items WHERE Name = N'Bí Kíp Thất Truyền')
        INSERT INTO Items (Name, Type, Description, Rarity, Effect) VALUES (N'Bí Kíp Thất Truyền', 'Manual', N'Bí kíp võ công cổ xưa.', 'Epic', '{"skill_unlock": "ancient_art"}')

    DECLARE @Item1 int = (SELECT TOP 1 Id FROM Items WHERE Name = N'Huyết Long Đan')
    DECLARE @Item2 int = (SELECT TOP 1 Id FROM Items WHERE Name = N'Bí Kíp Thất Truyền')

    INSERT INTO BlackMarketItems (ItemId, Price, Stock) VALUES 
    (@Item1, 5000, 3),
    (@Item2, 10000, 1)
END

-- Seed Initial Auction
IF NOT EXISTS (SELECT * FROM Auctions WHERE IsClosed = 0)
BEGIN
    DECLARE @AuctionItem int = (SELECT TOP 1 Id FROM Items WHERE Name = N'Huyết Long Đan')
    INSERT INTO Auctions (ItemId, SellerId, StartPrice, CurrentBid, EndTime)
    VALUES (@AuctionItem, NULL, 1000, 1000, DATEADD(hour, 24, GETDATE()))
END
