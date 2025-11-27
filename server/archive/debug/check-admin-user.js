
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const query = "SELECT Id, Username, Role FROM Users WHERE Role = 'admin'";

sql.query(connectionString, query, (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Admin Users:', rows);
    }
});
