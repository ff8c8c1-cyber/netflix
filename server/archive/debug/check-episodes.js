const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const query = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Episodes'";

sql.query(connectionString, query, (err, rows) => {
    if (err) {
        console.error('Error checking Episodes table:', err);
    } else {
        console.log('Episodes Table Columns:', rows);
    }
});
