const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const query = `
IF OBJECT_ID('sp_GetUsers', 'P') IS NOT NULL DROP PROCEDURE sp_GetUsers;
GO
CREATE PROCEDURE sp_GetUsers
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Username, Email, Role, Rank, Exp, Stones, MysteryBags, CreatedAt 
    FROM Users
    ORDER BY CreatedAt DESC;
END
`;

const sps = query.split('GO');

async function run() {
    console.log('Creating sp_GetUsers...');

    for (const sp of sps) {
        if (sp.trim()) {
            await new Promise((resolve, reject) => {
                sql.query(connectionString, sp, (err) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
    }

    console.log('sp_GetUsers created successfully.');
}

run();
