
import sql from 'msnodesqlv8';

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const updates = [
    {
        id: 1,
        title: 'Phàm Nhân Tu Tiên',
        category: 'huyền huyễn',
        description: 'Hàn Lập, một kẻ phàm nhân, làm sao để đứng vững giữa tu chân giới đầy rẫy nguy hiểm?'
    },
    {
        id: 2,
        title: 'Đấu Phá Thương Khung',
        category: 'hành động',
        description: 'Ba mươi năm hà đông, ba mươi năm hà tây, đừng khinh thiếu niên nghèo!'
    }
];

function updateMovie(movie) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE Movies SET Title = N'${movie.title}', Category = N'${movie.category}', Description = N'${movie.description}' WHERE Id = ${movie.id}`;

        sql.query(connectionString, query, (err, rows) => {
            if (err) {
                console.error(`Error updating movie ${movie.id}:`, err);
                reject(err);
            } else {
                console.log(`Updated movie ${movie.id}`);
                resolve();
            }
        });
    });
}

async function run() {
    try {
        for (const movie of updates) {
            await updateMovie(movie);
        }
        console.log('All updates completed');
    } catch (error) {
        console.error('Failed:', error);
    }
}

run();
