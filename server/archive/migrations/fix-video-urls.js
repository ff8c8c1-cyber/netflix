
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

// Using a reliable MP4 link (Big Buck Bunny)
const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

const updateQuery = `
UPDATE Episodes
SET VideoUrl = '${videoUrl}'
`;

const updateMoviesQuery = `
UPDATE Movies
SET VideoUrl = '${videoUrl}'
`;

function run() {
    console.log('Updating video URLs...');

    sql.query(connectionString, updateQuery, (err) => {
        if (err) console.error('Error updating episodes:', err);
        else {
            console.log('Episodes updated with MP4 URL.');

            sql.query(connectionString, updateMoviesQuery, (e) => {
                if (e) console.error('Error updating movies:', e);
                else console.log('Movies updated with MP4 URL.');
            });
        }
    });
}

run();
