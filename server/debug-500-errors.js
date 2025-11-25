const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

async function run() {
    console.log('🔍 Debugging 500 Errors...');

    // 1. Test sp_CheckFavorite
    console.log('\n1️⃣ Testing sp_CheckFavorite...');
    try {
        const query1 = "EXEC sp_CheckFavorite @UserId = 3, @MovieId = 8";
        await new Promise((resolve, reject) => {
            sql.query(connectionString, query1, (err, rows) => {
                if (err) reject(err);
                else {
                    console.log('✅ sp_CheckFavorite success:', rows);
                    resolve();
                }
            });
        });
    } catch (err) {
        console.error('❌ sp_CheckFavorite failed:', err);
    }

    // 2. Test sp_UpdateWatchHistory
    console.log('\n2️⃣ Testing sp_UpdateWatchHistory...');
    try {
        const query2 = "EXEC sp_UpdateWatchHistory @UserId = 3, @MovieId = 8, @EpisodeId = 487, @ProgressSeconds = 10";
        await new Promise((resolve, reject) => {
            sql.query(connectionString, query2, (err, rows) => {
                if (err) reject(err);
                else {
                    console.log('✅ sp_UpdateWatchHistory success');
                    resolve();
                }
            });
        });
    } catch (err) {
        console.error('❌ sp_UpdateWatchHistory failed:', err);
    }
}

run();
