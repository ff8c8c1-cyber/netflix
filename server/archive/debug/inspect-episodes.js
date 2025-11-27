
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const query = "SELECT TOP 5 Id, MovieId, EpisodeNumber, VideoUrl FROM Episodes";

sql.query(connectionString, query, (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Episodes Data:', rows);
    }
});
