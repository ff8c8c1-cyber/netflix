const { query } = require('./db');

async function checkMovieData() {
    console.log('--- Checking Movie Data for ID 7 ---');

    try {
        const movies = await query('SELECT * FROM Movies WHERE id = 7');
        console.log('Movie Data:', movies.recordset[0]);

        const episodes = await query('SELECT * FROM Episodes WHERE MovieId = 7');
        console.log('Episodes Data:', episodes.recordset);

    } catch (err) {
        console.error('Error:', err);
    }
    process.exit();
}

checkMovieData();
