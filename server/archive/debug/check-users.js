
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const query = "SELECT * FROM Users";

sql.query(connectionString, query, (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Users in DB:', rows);
    }
});
