const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

async function run() {
    console.log('🧪 Testing Watch History Flow...');

    const userId = 3; // Assuming user 3 exists from previous logs
    const movieId = 11; // Assuming movie 11 exists
    const episodeId = 568; // Assuming episode 568 exists
    const progress = 120; // 2 minutes

    // 1. Update Watch History
    console.log(`\n1️⃣ Updating Watch History for User ${userId}, Movie ${movieId}, Episode ${episodeId}...`);
    const updateQuery = `EXEC sp_UpdateWatchHistory @UserId = ${userId}, @MovieId = ${movieId}, @EpisodeId = ${episodeId}, @ProgressSeconds = ${progress}`;

    await new Promise((resolve, reject) => {
        sql.query(connectionString, updateQuery, (err) => {
            if (err) {
                console.error('❌ Error updating history:', err);
                reject(err);
            } else {
                console.log('✅ History updated successfully.');
                resolve();
            }
        });
    });

    // 2. Get Watch History
    console.log(`\n2️⃣ Retrieving Watch History for User ${userId}...`);
    const getQuery = `EXEC sp_GetWatchHistory @UserId = ${userId}`;

    await new Promise((resolve, reject) => {
        sql.query(connectionString, getQuery, (err, rows) => {
            if (err) {
                console.error('❌ Error retrieving history:', err);
                reject(err);
            } else {
                console.log('✅ History retrieved:', rows);

                const entry = rows.find(r => r.Id === movieId || r.MovieId === movieId); // Adjust based on return columns
                if (entry) {
                    console.log('🎯 Found entry:', entry);
                    if (entry.ProgressSeconds === progress) {
                        console.log('✅ Progress matches!');
                    } else {
                        console.error(`❌ Progress mismatch! Expected ${progress}, got ${entry.ProgressSeconds}`);
                    }
                } else {
                    console.error('❌ Entry not found in history!');
                }
                resolve();
            }
        });
    });
}

run().catch(err => console.error('Test failed:', err));
