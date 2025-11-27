
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const schemaUpdate = `
-- Add IsBreakthroughReady column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'IsBreakthroughReady')
BEGIN
    ALTER TABLE Users ADD IsBreakthroughReady BIT DEFAULT 0;
END

-- sp_AttemptBreakthrough
IF OBJECT_ID('sp_AttemptBreakthrough', 'P') IS NOT NULL DROP PROCEDURE sp_AttemptBreakthrough;
GO
CREATE PROCEDURE sp_AttemptBreakthrough
    @UserId INT,
    @UseItem BIT = 0 -- Future: Use item to increase chance
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentRank INT;
    DECLARE @CurrentExp INT;
    DECLARE @SuccessChance INT = 50; -- Base 50%
    DECLARE @Roll INT;
    
    SELECT @CurrentRank = Rank, @CurrentExp = Exp FROM Users WHERE Id = @UserId;
    
    -- Simple RNG (0-100)
    SELECT @Roll = ABS(CHECKSUM(NEWID())) % 100;
    
    IF @UseItem = 1
    BEGIN
        SET @SuccessChance = @SuccessChance + 20; -- Item adds 20%
    END
    
    IF @Roll < @SuccessChance
    BEGIN
        -- SUCCESS
        UPDATE Users 
        SET Rank = Rank + 1, 
            Exp = 0, 
            IsBreakthroughReady = 0 
        WHERE Id = @UserId;
        
        SELECT 1 AS Result, 'Đột phá thành công!' AS Message, @CurrentRank + 1 AS NewRank;
    END
    ELSE
    BEGIN
        -- FAIL: Lose 30% EXP
        UPDATE Users 
        SET Exp = CAST(Exp * 0.7 AS INT),
            IsBreakthroughReady = 0 
        WHERE Id = @UserId;
        
        SELECT 0 AS Result, 'Đột phá thất bại! Bạn bị tẩu hỏa nhập ma, mất 30% tu vi.' AS Message, @CurrentRank AS NewRank;
    END
END
GO
`;

function run() {
    console.log('Updating schema for Tribulation System...');

    const parts = schemaUpdate.split('GO');
    let p = Promise.resolve();

    // 1. Add Column (First part)
    p = p.then(() => new Promise((resolve, reject) => {
        sql.query(connectionString, parts[0], (err) => {
            if (err) console.error('Error adding column:', err);
            else console.log('Column check complete.');
            resolve();
        });
    }));

    // 2. Create SP
    p = p.then(() => new Promise((resolve, reject) => {
        sql.query(connectionString, parts[1], (err) => {
            if (err) console.error('Error creating SP:', err);
            else console.log('sp_AttemptBreakthrough created.');
            resolve();
        });
    }));

    p.then(() => console.log('Tribulation Schema Updated.'));
}

run();
