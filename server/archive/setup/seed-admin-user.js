
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const seedAdmin = `
IF NOT EXISTS (SELECT * FROM Users WHERE Username = 'admin')
BEGIN
    INSERT INTO Users (Username, PasswordHash, Email, AvatarUrl, Rank, Exp, Stones, SectId, Role)
    VALUES ('admin', '123456', 'admin@tiengioi.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 5, 100000, 999999, 1, 'admin');
    PRINT 'Admin user created.';
END
ELSE
BEGIN
    UPDATE Users SET Role = 'admin', PasswordHash = '123456' WHERE Username = 'admin';
    PRINT 'Admin user updated.';
END
`;

function run() {
    console.log('Seeding admin user...');
    sql.query(connectionString, seedAdmin, (err) => {
        if (err) {
            console.error('Error seeding admin:', err);
        } else {
            console.log('Admin user ready.');
        }
    });
}

run();
