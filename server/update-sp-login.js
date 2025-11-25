
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const updateSP = `
IF OBJECT_ID('sp_LoginUser', 'P') IS NOT NULL DROP PROCEDURE sp_LoginUser
GO
CREATE PROCEDURE [dbo].[sp_LoginUser]
    @Username nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Username, PasswordHash, AvatarUrl, Rank, Exp, Stones, SectId, Role FROM Users WHERE Username = @Username;
END
GO
`;

function run() {
    console.log('Updating sp_LoginUser...');

    const sps = updateSP.split('GO');
    let p = Promise.resolve();

    sps.forEach(sp => {
        if (sp.trim()) {
            p = p.then(() => new Promise((resolve, reject) => {
                sql.query(connectionString, sp, (err) => {
                    if (err) console.error('Error updating SP:', err);
                    resolve();
                });
            }));
        }
    });

    p.then(() => console.log('sp_LoginUser updated successfully.'));
}

run();
