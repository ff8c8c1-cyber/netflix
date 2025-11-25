
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const query = `
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Pets'
`;

sql.query(connectionString, query, (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Pets Table Columns:', rows);
    }
});
