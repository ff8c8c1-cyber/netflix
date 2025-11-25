
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const spDefinitions = `
-- sp_GetAllUsers
IF OBJECT_ID('sp_GetAllUsers', 'P') IS NOT NULL DROP PROCEDURE sp_GetAllUsers;
GO
CREATE PROCEDURE sp_GetAllUsers
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Username, Email, Role, Rank, Exp, Stones, SectId, CreatedAt FROM Users ORDER BY Id DESC;
END
GO

-- sp_UpdateUserAdmin
IF OBJECT_ID('sp_UpdateUserAdmin', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateUserAdmin;
GO
CREATE PROCEDURE sp_UpdateUserAdmin
    @Id INT,
    @Username NVARCHAR(50),
    @Email NVARCHAR(100),
    @Role NVARCHAR(50),
    @Rank INT,
    @Exp INT,
    @Stones INT
AS
BEGIN
    UPDATE Users
    SET Username = @Username,
        Email = @Email,
        Role = @Role,
        Rank = @Rank,
        Exp = @Exp,
        Stones = @Stones
    WHERE Id = @Id;
END
GO

-- sp_DeleteUser
IF OBJECT_ID('sp_DeleteUser', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteUser;
GO
CREATE PROCEDURE sp_DeleteUser
    @Id INT
AS
BEGIN
    -- Delete related data first (optional, or use CASCADE in FKs)
    DELETE FROM UserItems WHERE UserId = @Id;
    DELETE FROM Transactions WHERE UserId = @Id;
    DELETE FROM WatchHistory WHERE UserId = @Id;
    DELETE FROM Reviews WHERE UserId = @Id;
    DELETE FROM Comments WHERE UserId = @Id;
    DELETE FROM Notifications WHERE UserId = @Id;
    
    DELETE FROM Users WHERE Id = @Id;
END
GO
`;

function run() {
    console.log('Creating User Management Stored Procedures...');

    const sps = spDefinitions.split('GO');
    let p = Promise.resolve();

    sps.forEach(sp => {
        if (sp.trim()) {
            p = p.then(() => new Promise((resolve, reject) => {
                sql.query(connectionString, sp, (err) => {
                    if (err) console.error('Error creating SP:', err);
                    resolve();
                });
            }));
        }
    });

    p.then(() => console.log('User Management SPs created.'));
}

run();
