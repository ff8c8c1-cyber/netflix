import { supabase } from './supabase';
import { MOCK_MOVIES } from '../data/mockData';

// Sample movie data - expanded with cover images and video URLs
const SEED_MOVIES = [
    {
        id: 1,
        title: "Phàm Nhân Tu Tiên: Phong Khởi",
        description: "Hàn Lập, một kẻ phàm nhân với tư chất tầm thường, làm sao để đứng vững giữa tu chân giới đầy rẫy nguy hiểm? Một hành trình đầy mưu mô, quỷ kế và chiến đấu kinh thiên động địa.",
        cover_image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400",
        video_url: "https://www.youtube.com/watch?v=S_KYYuFj3pk",
        episode_count: 72,
        rating: 9.8,
        views: 1250000,
        category: "huyền huyễn",
    },
    {
        id: 2,
        title: "Đấu Phá Thương Khung",
        description: "Ba mươi năm hà đông, ba mươi năm hà tây, đừng khinh thiếu niên nghèo! Xiao Yan từ một thiếu niên vô danh trở thành cao thủ đỉnh phong tu chân giới.",
        cover_image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400",
        video_url: "https://www.youtube.com/watch?v=J5k1yJgX5kI",
        episode_count: 52,
        rating: 9.5,
        views: 980000,
        category: "hành động",
    },
    {
        id: 3,
        title: "Thôn Phệ Tinh Không",
        description: "La Phong và hành trình vươn ra vũ trụ bao la. Một thanh niên nông thôn làm thế nào để thay đổi số phận và chinh phục các tinh thần trên toàn vũ trụ.",
        cover_image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400",
        video_url: "https://www.youtube.com/watch?v=7X8II6J-6mU",
        episode_count: 80,
        rating: 9.6,
        views: 850000,
        category: "khoa học viễn tưởng",
    },
    {
        id: 4,
        title: "Thế Giới Hoàn Mỹ",
        description: "Một hạt bụi có thể lấp biển, một cọng cỏ trảm hết nhật nguyệt tinh tú. Một câu chuyện về sự kiên trì, nghị lực và sức mạnh tâm linh trong thế giới tu chân.",
        cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        video_url: "https://www.youtube.com/watch?v=8Qn_spdM5Zg",
        episode_count: 130,
        rating: 9.9,
        views: 2100000,
        category: "huyền huyễn",
    },
    {
        id: 5,
        title: "Sư Huynh A Sư Huynh",
        description: "Sư huynh ta quá cẩn trọng rồi, rõ ràng mạnh vô địch nhưng cứ thích giả heo ăn hổ. Một câu chuyện hài hước về sư huynh cuồng ngạo nhất tu chân giới.",
        cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        episode_count: 20,
        rating: 8.8,
        views: 500000,
        category: "hài hước",
    },
    {
        id: 6,
        title: "Ma Thần",
        description: "Linh hồn của một ma thần thức tỉnh trong cơ thể một thiếu niên. Một hành trình phục thù và thống trị thế giới tu chân đầy máu và nước mắt.",
        cover_image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400",
        video_url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        episode_count: 98,
        rating: 9.2,
        views: 750000,
        category: "hành động",
    },
    {
        id: 7,
        title: "Thiên Hào",
        description: "Một thiên tài thực sự không cần khí tướng, chỉ cần tâm tư! Một câu chuyện về sự thức tỉnh và thống trị thiên đạo nguyên thủy.",
        cover_image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400",
        video_url: "https://www.youtube.com/watch?v=epTgOoJ2dFY",
        episode_count: 67,
        rating: 9.0,
        views: 650000,
        category: "huyền huyễn",
    },
    {
        id: 8,
        title: "Vô Nhẫn Tiên Nghịch",
        description: "Tu chân trong thế giới mà tiên nghịch tồn tại khắp nơi. Một thiếu niên tưởng bị vứt bỏ nhưng thực ra là thiên kiêu muôn năm khó gặp.",
        cover_image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
        video_url: "https://www.youtube.com/watch?v=fHvbDf6EeVQ",
        episode_count: 89,
        rating: 9.4,
        views: 920000,
        category: "huyền huyễn",
    },
    {
        id: 9,
        title: "Tiên Nghịch Nhất Giới",
        description: "Tại tiên nghịch nhất giới, mỗi kẻ đều là trời! Một câu chuyện về thiên tài thật sự và sự vinh quang trong thế giới nghịch thiên.",
        cover_image: "https://images.unsplash.com/photo-1470813740231-003ebbec62aa?w=400",
        video_url: "https://www.youtube.com/watch?v=kKPZQq8GcD8",
        episode_count: 45,
        rating: 8.9,
        views: 420000,
        category: "hành động",
    },
    {
        id: 10,
        title: "Kiếm Tông Đỉnh Cấp",
        description: "Tại ngôi kiếm tông đỉnh cấp này, thứ bạn cần không phải là tư chất, mà là đạo tâm kiên cố! Học viện kiếm đạo hấp dẫn nhất tu chân giới.",
        cover_image: "https://images.unsplash.com/photo-1474564862101-99118a8ec1dd?w=400",
        video_url: "https://www.youtube.com/watch?v=YZjqQCz_Joc",
        episode_count: 78,
        rating: 9.1,
        views: 580000,
        category: "khoa học viễn tưởng",
    },
    {
        id: 11,
        title: "Ta Có Một Thăng Long Cảnh",
        description: "Ta có một thăng long cảnh trong nhà, sau này ta sẽ thăng thăng long long thành tiên! Một câu chuyện vui vẻ về rồng nhỏ ngoe nguẩy.",
        cover_image: "https://images.unsplash.com/photo-1551495708-5bb6cc5f4778?w=400",
        video_url: "https://www.youtube.com/watch?v=example1",
        episode_count: 25,
        rating: 8.5,
        views: 310000,
        category: "hài hước",
    },
    {
        id: 12,
        title: "Chí Tôn Tu Chân",
        description: "Tại thế giới này, tư chất chỉ là yếu tố phụ trợ, quyết định thành công là tố muội, nghị lực và may mắn! Chí tôn tu chân giới.",
        cover_image: "https://images.unsplash.com/photo-1519081042110-63c629a4cf93?w=400",
        video_url: "https://www.youtube.com/watch?v=example2",
        episode_count: 62,
        rating: 8.7,
        views: 370000,
        category: "huyền huyễn",
    }
];

// Sample user profiles for demonstration
const SAMPLE_USERS = [
    {
        id: 'sample-user-1',
        username: 'dao_huynh',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DaoHuynh',
        rank: 3,
        exp: 8500,
        stones: 1250,
        sect_id: 1
    },
    {
        id: 'sample-user-2',
        username: 'tien_tu',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TienTu',
        rank: 2,
        exp: 6200,
        stones: 890,
        sect_id: 2
    },
    {
        id: 'sample-user-3',
        username: 'huyen_thien_di_tu',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HuyenThien',
        rank: 4,
        exp: 12000,
        stones: 2100,
        sect_id: 1
    }
];

// Sample reviews for movies
const SAMPLE_REVIEWS = [
    { user_id: 'sample-user-1', movie_id: 1, rating: 10, comment: 'Tuyệt đỉnh! Phàm nhân tu tiên đỉnh cao nhất!' },
    { user_id: 'sample-user-1', movie_id: 2, rating: 9, comment: 'Đấu phá thương khung mãi đỉnh!' },
    { user_id: 'sample-user-2', movie_id: 1, rating: 10, comment: 'Hàn Lập là đại sư huynh của tôi!' },
    { user_id: 'sample-user-2', movie_id: 3, rating: 9, comment: 'Thôn phệ tinh không quá chất!' },
    { user_id: 'sample-user-3', movie_id: 4, rating: 10, comment: 'Thế giới hoàn mỹ đỉnh cao tu chân giới!' },
    { user_id: 'sample-user-3', movie_id: 7, rating: 8, comment: 'Thiên hào khá hay, recommend!' }
];

// Sample comments for movie discussions
const SAMPLE_COMMENTS = [
    { user_id: 'sample-user-1', movie_id: 1, content: 'Hàn Lập chiếng nghiệm thật quá kinh! Ai đã xem tập mới chưa?', likes: 15 },
    { user_id: 'sample-user-2', movie_id: 1, content: 'Kinh quá, Vỡ vừa cười vừa khóc! Hàn Lập dư là xuất sắc', likes: 8 },
    { user_id: 'sample-user-1', movie_id: 2, content: 'Sau khi xem đấu phá, tôi quyết định tu chân luôn!', likes: 12 },
    { user_id: 'sample-user-3', movie_id: 4, content: 'Thần tác! Thế giới hoàn mỹ mãi đỉnh!', likes: 25 },
    { user_id: 'sample-user-2', movie_id: 6, content: 'Ma thần này cũng hay lắm, plot twist nhiều', likes: 11 }
];

// Sample playlists
const SAMPLE_PLAYLISTS = [
    { user_id: 'sample-user-1', name: 'Đỉnh Cao Tu Chân', description: 'Những bộ phim tu chân đỉnh cao nhất', is_public: true },
    { user_id: 'sample-user-2', name: 'Hành Động Gay Gắt', description: 'Phim hành động cực kỳ gay cấn', is_public: true },
    { user_id: 'sample-user-3', name: 'Playlist Cá Nhân', description: 'Các bộ phim mình yêu thích', is_public: false }
];

// Sample playlist items
const SAMPLE_PLAYLIST_ITEMS = [
    { playlist_id: 1, movie_id: 1, order_index: 1 },
    { playlist_id: 1, movie_id: 4, order_index: 2 },
    { playlist_id: 1, movie_id: 8, order_index: 3 },
    { playlist_id: 2, movie_id: 2, order_index: 1 },
    { playlist_id: 2, movie_id: 6, order_index: 2 },
    { playlist_id: 2, movie_id: 9, order_index: 3 },
    { playlist_id: 3, movie_id: 7, order_index: 1 },
    { playlist_id: 3, movie_id: 10, order_index: 2 }
];

// Sample notifications
const SAMPLE_NOTIFICATIONS = [
    { user_id: 'sample-user-1', title: 'Chào mừng tới Tiên Giới!', content: 'Chúc mừng bạn đã tham gia Huyền Thiên Tông!', type: 'welcome' },
    { user_id: 'sample-user-2', title: 'Nhật ký tu luyện mới', content: 'Đã có phim mới cập nhật!', type: 'update' },
    { user_id: 'sample-user-3', title: 'Khuyến nghị đặc biệt', content: 'Chúng tôi nghĩ bạn sẽ thích "Thế Giới Hoàn Mỹ"', type: 'recommendation' }
];

// Helper function to seed all sample users (Note: This requires auth users to exist first)
export const seedSampleUsers = async () => {
    try {
        console.log('Note: Sample users require existing auth users to work properly');
        console.log('Sample user IDs:', SAMPLE_USERS.map(u => u.id));
        return SAMPLE_USERS;
    } catch (error) {
        console.error('Error seeding users (requires auth):', error);
        throw error;
    }
};

// Function to seed reviews
export const seedReviews = async () => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .upsert(SAMPLE_REVIEWS, {
                onConflict: 'user_id,movie_id',
                ignoreDuplicates: true
            })
            .select();

        if (error) {
            console.error('Error seeding reviews:', error);
            throw error;
        }

        console.log('Reviews seeded successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to seed reviews:', error);
        throw error;
    }
};

// Function to seed comments
export const seedComments = async () => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .insert(SAMPLE_COMMENTS)
            .select();

        if (error) {
            console.error('Error seeding comments:', error);
            throw error;
        }

        console.log('Comments seeded successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to seed comments:', error);
        throw error;
    }
};

// Function to seed playlists
export const seedPlaylists = async () => {
    try {
        const { data, error } = await supabase
            .from('playlists')
            .insert(SAMPLE_PLAYLISTS)
            .select();

        if (error) {
            console.error('Error seeding playlists:', error);
            throw error;
        }

        console.log('Playlists seeded successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to seed playlists:', error);
        throw error;
    }
};

// Function to seed playlist items
export const seedPlaylistItems = async () => {
    try {
        const { data, error } = await supabase
            .from('playlist_items')
            .insert(SAMPLE_PLAYLIST_ITEMS)
            .select();

        if (error) {
            console.error('Error seeding playlist items:', error);
            throw error;
        }

        console.log('Playlist items seeded successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to seed playlist items:', error);
        throw error;
    }
};

// Function to seed notifications
export const seedNotifications = async () => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert(SAMPLE_NOTIFICATIONS)
            .select();

        if (error) {
            console.error('Error seeding notifications:', error);
            throw error;
        }

        console.log('Notifications seeded successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to seed notifications:', error);
        throw error;
    }
};

// Function to seed movies data
export const seedMovies = async () => {
    try {
        const { data, error } = await supabase
            .from('movies')
            .upsert(SEED_MOVIES, { onConflict: 'id' })
            .select();

        if (error) {
            console.error('Error seeding movies:', error);
            throw error;
        }

        console.log('Movies seeded successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to seed movies:', error);
        throw error;
    }
};

// Function to get current movie count
export const getMovieCount = async () => {
    try {
        const { count, error } = await supabase
            .from('movies')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error getting movie count:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Failed to get movie count:', error);
        return 0;
    }
};

// Function to initialize database with complete sample data
export const initializeDatabase = async () => {
    console.log('Initializing database with comprehensive sample data...');

    try {
        const movieCount = await getMovieCount();
        console.log(`Current movie count: ${movieCount}`);

        if (movieCount === 0) {
            console.log('🌱 Seeding movies...');
            await seedMovies();

            console.log('🌱 Seeding reviews...');
            try { await seedReviews(); } catch (e) { console.warn('Reviews seeding failed (users may not exist):', e.message); }

            console.log('🌱 Seeding comments...');
            try { await seedComments(); } catch (e) { console.warn('Comments seeding failed (users may not exist):', e.message); }

            console.log('🌱 Seeding playlists...');
            try { await seedPlaylists(); } catch (e) { console.warn('Playlists seeding failed (users may not exist):', e.message); }

            console.log('🌱 Seeding playlist items...');
            try { await seedPlaylistItems(); } catch (e) { console.warn('Playlist items seeding failed:', e.message); }

            console.log('🌱 Seeding notifications...');
            try { await seedNotifications(); } catch (e) { console.warn('Notifications seeding failed (users may not exist):', e.message); }

            console.log('🎉 Database initialization complete!');
            console.log('📊 Sample data loaded:');
            console.log('   • 12 Movies');
            console.log('   • Reviews, Comments, Playlists');
            console.log('   • Notifications, Playlist Items');
            console.log('   • Categories: huyền huyễn, hành động, hài hước, khoa học viễn tưởng');

        } else {
            console.log('✅ Database already has data, skipping seeding.');
        }

        console.log('🚀 Application ready! Visit localhost:5175');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        console.warn('⚠️ Application may work with limited data');
    }
};
