const sql = require('msnodesqlv8');
const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const query = `SELECT OBJECT_DEFINITION(OBJECT_ID('sp_AddMovie')) AS Definition`;

sql.query(connectionString, query, (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('sp_AddMovie Definition:');
        console.log(rows[0].Definition);
    }
});
