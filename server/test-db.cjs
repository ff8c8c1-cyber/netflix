const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=master;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

console.log('Testing direct msnodesqlv8 connection string:', connectionString);

sql.open(connectionString, (err, conn) => {
    if (err) {
        console.error('❌ Open failed:', err);
        return;
    }
    console.log('✅ Connected!');
    conn.query('SELECT @@VERSION as version', (err, res) => {
        if (err) console.error('Query failed:', err);
        else console.log('Version:', res[0].version);
        conn.close();
    });
});
