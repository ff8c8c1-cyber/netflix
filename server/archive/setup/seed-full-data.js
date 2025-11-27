
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const movies = [
    {
        title: 'Phàm Nhân Tu Tiên: Phong Khởi',
        description: 'Hàn Lập, một kẻ phàm nhân, làm sao để đứng vững giữa tu chân giới đầy rẫy nguy hiểm? Một hành trình đầy rẫy mưu mô, quỷ kế và những trận chiến kinh thiên động địa.',
        cover_image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
        video_url: 'https://www.youtube.com/watch?v=S_KYYuFj3pk',
        episode_count: 72,
        rating: 9.8,
        views: 1250000,
        category: 'huyền huyễn'
    },
    {
        title: 'Đấu Phá Thương Khung',
        description: 'Ba mươi năm hà đông, ba mươi năm hà tây, đừng khinh thiếu niên nghèo! Tiêu Viêm và hành trình trở thành Đấu Đế.',
        cover_image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&q=80',
        video_url: 'https://www.youtube.com/watch?v=J5k1yJgX5kI',
        episode_count: 52,
        rating: 9.5,
        views: 980000,
        category: 'hành động'
    },
    {
        title: 'Thôn Phệ Tinh Không',
        description: 'La Phong và hành trình vươn ra vũ trụ bao la, chiến đấu với các chủng tộc ngoài hành tinh để bảo vệ Trái Đất.',
        cover_image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
        video_url: 'https://www.youtube.com/watch?v=7X8II6J-6mU',
        episode_count: 80,
        rating: 9.6,
        views: 850000,
        category: 'khoa học viễn tưởng'
    },
    {
        title: 'Thế Giới Hoàn Mỹ',
        description: 'Một hạt bụi có thể lấp biển, một cọng cỏ trảm hết nhật nguyệt tinh tú. Thạch Hạo sinh ra vì ứng kiếp, đi lên con đường vô địch.',
        cover_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
        video_url: 'https://www.youtube.com/watch?v=8Qn_spdM5Zg',
        episode_count: 130,
        rating: 9.9,
        views: 2100000,
        category: 'huyền huyễn'
    },
    {
        title: 'Sư Huynh A Sư Huynh',
        description: 'Sư huynh ta quá cẩn trọng rồi, rõ ràng mạnh vô địch nhưng cứ thích giả heo ăn hổ. Câu chuyện hài hước về con đường tu tiên.',
        cover_image: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        episode_count: 20,
        rating: 8.8,
        views: 500000,
        category: 'hài hước'
    },
    {
        title: 'Nhất Niệm Vĩnh Hằng',
        description: 'Bạch Tiểu Thuần, một kẻ sợ chết nhưng lại có thiên phú luyện đan kinh người. Hắn làm náo loạn cả tu chân giới.',
        cover_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        episode_count: 60,
        rating: 9.2,
        views: 750000,
        category: 'hài hước'
    },
    {
        title: 'Vũ Canh Kỷ',
        description: 'Cuộc chiến giữa con người và Thần tộc. Vũ Canh mang trong mình dòng máu bán thần, đứng lên chống lại sự áp bức.',
        cover_image: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        episode_count: 45,
        rating: 9.0,
        views: 600000,
        category: 'hành động'
    },
    {
        title: 'Linh Lung',
        description: 'Thế giới giả tưởng nơi con người và quái vật cùng tồn tại. Những bí ẩn về nền văn minh cổ đại dần được hé lộ.',
        cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        episode_count: 12,
        rating: 8.5,
        views: 300000,
        category: 'khoa học viễn tưởng'
    },
    {
        title: 'Tiên Nghịch',
        description: 'Vương Lâm, một thiếu niên bình thường, vì muốn báo thù cho cha mẹ mà bước vào con đường tu tiên đầy máu và nước mắt.',
        cover_image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        episode_count: 24,
        rating: 9.4,
        views: 880000,
        category: 'huyền huyễn'
    },
    {
        title: 'Toàn Chức Pháp Sư',
        description: 'Mạc Phàm tỉnh dậy và thấy thế giới đã thay đổi, trường học dạy ma pháp thay vì khoa học. Hắn mang trong mình song hệ lôi hỏa.',
        cover_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        episode_count: 36,
        rating: 8.9,
        views: 650000,
        category: 'hành động'
    }
];

function executeQuery(query) {
    return new Promise((resolve, reject) => {
        sql.query(connectionString, query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function seedMovies() {
    console.log('Seeding movies...');
    try {
        // Check existing movies to avoid duplicates (simple check by title)
        const existing = await executeQuery("SELECT Title FROM Movies");
        const existingTitles = existing.map(r => r.Title);

        for (const movie of movies) {
            if (existingTitles.includes(movie.title)) {
                // Update existing
                console.log(`Updating ${movie.title}...`);
                await executeQuery(`
                    UPDATE Movies 
                    SET Description = N'${movie.description}', 
                        CoverImage = N'${movie.cover_image}',
                        VideoUrl = N'${movie.video_url}',
                        EpisodeCount = ${movie.episode_count},
                        Rating = ${movie.rating},
                        Views = ${movie.views},
                        Category = N'${movie.category}'
                    WHERE Title = N'${movie.title}'
                `);
            } else {
                // Insert new
                console.log(`Inserting ${movie.title}...`);
                await executeQuery(`
                    INSERT INTO Movies (Title, Description, CoverImage, VideoUrl, EpisodeCount, Rating, Views, Category)
                    VALUES (N'${movie.title}', N'${movie.description}', N'${movie.cover_image}', N'${movie.video_url}', ${movie.episode_count}, ${movie.rating}, ${movie.views}, N'${movie.category}')
                `);
            }
        }
        console.log('Movies seeded successfully.');
    } catch (error) {
        console.error('Error seeding movies:', error);
    }
}

async function run() {
    await seedMovies();
    console.log('Database population complete.');
}

run();
