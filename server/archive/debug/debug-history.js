const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const query = "EXEC sp_GetWatchHistory @UserId = 3";

sql.query(connectionString, query, (err, rows) => {
    if (err) {
        console.error('Error executing sp_GetWatchHistory:', err);
    } else {
        console.log('Result:', rows);
    }
});
