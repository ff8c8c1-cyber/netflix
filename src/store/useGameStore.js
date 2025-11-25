import { create } from 'zustand';
import { API_BASE_URL } from '../config/api';
import { movieService } from '../lib/services';


// Constants
export const RANKS = [
    { name: 'Phàm Nhân', maxExp: 100, color: 'text-gray-400', border: 'border-gray-600' },
    { name: 'Trúc Cơ', maxExp: 2000, color: 'text-emerald-400', border: 'border-emerald-500' },
    { name: 'Kết Đan', maxExp: 5000, color: 'text-yellow-400', border: 'border-yellow-500' },
    { name: 'Nguyên Anh', maxExp: 15000, color: 'text-purple-400', border: 'border-purple-500' },
    { name: 'Hóa Thần', maxExp: 50000, color: 'text-red-500', border: 'border-red-600' },
    { name: 'Luyện Hư', maxExp: 100000, color: 'text-rose-400', border: 'border-rose-500' },
];

export const SECTS = [
    { id: 1, name: 'Thanh Vân Môn', type: 'Chính Đạo', buff: 'Tăng 10% EXP khi xem phim Tiên Hiệp' },
    { id: 2, name: 'Hợp Hoan Tông', type: 'Tà Đạo', buff: 'Tăng 20% Linh Thạch rơi ra' },
    { id: 3, name: 'Vạn Kiếm Sơn', type: 'Trung Lập', buff: 'Tăng 5% Sát thương bình luận (Dame to)' },
];

export const ITEMS = [
    { id: 1, name: 'Trúc Cơ Đan', price: 500, desc: 'Tăng 10% tỉ lệ đột phá Trúc Cơ', icon: '💊', type: 'consumable' },
    { id: 2, name: 'Tụ Khí Tán', price: 100, desc: 'Tăng 200 EXP ngay lập tức', icon: '🧪', type: 'consumable' },
    { id: 3, name: 'Kiếm Gỗ Đào', price: 1000, desc: 'Vật phẩm trang trí, trừ tà', icon: '🗡️', type: 'equipment' },
    { id: 4, name: 'Thẻ VIP 1 Tháng', price: 5000, desc: 'X2 tốc độ tu luyện trong 30 ngày', icon: '🎫', type: 'special' },
    { id: 5, name: 'Loa Thế Giới', price: 200, desc: 'Chat kênh thế giới', icon: '📢', type: 'consumable' },
    { id: 6, name: 'Trang Phục Tiên Tôn', price: 10000, desc: 'Trang phục lộng lẫy', icon: '👘', type: 'cosmetic' },
    { id: 7, name: 'Linh Thú: Hỏa Kỳ Lân', price: 50000, desc: 'Thú cưỡi thần thoại', icon: '🦁', type: 'mount' },
];

export const PET_DATA = [
    // Divine (1%)
    { id: 'p_divine_1', name: 'Hỏa Kỳ Lân', type: 'Thần Thú', rarity: 'divine', power: 5000, image: 'https://image.pollinations.ai/prompt/fire%20kirin%20mythical%20creature%20glowing%20scales%20epic%20fantasy%20art?width=800&height=600&nologo=true', desc: 'Thú cưỡi truyền thuyết, tăng 50% tốc độ tu luyện.' },
    { id: 'p_divine_2', name: 'Chu Tước', type: 'Thần Thú', rarity: 'divine', power: 5200, image: 'https://image.pollinations.ai/prompt/vermilion%20bird%20phoenix%20fire%20mythical%20creature%20epic%20fantasy?width=800&height=600&nologo=true', desc: 'Tái sinh từ tro tàn, sở hữu ngọn lửa bất diệt và khả năng hồi sinh.' },

    // Saint (5%)
    { id: 'p_saint_1', name: 'Thanh Long', type: 'Thánh Thú', rarity: 'saint', power: 3500, image: 'https://image.pollinations.ai/prompt/azure%20dragon%20chinese%20mythology%20clouds%20lightning?width=800&height=600&nologo=true', desc: 'Rồng xanh uy mãnh, hộ chủ khi gặp nguy nan.' },
    { id: 'p_saint_2', name: 'Bạch Hổ', type: 'Thánh Thú', rarity: 'saint', power: 3400, image: 'https://image.pollinations.ai/prompt/white%20tiger%20mythical%20beast%20ice%20armor%20glowing%20blue%20eyes?width=800&height=600&nologo=true', desc: 'Chiến thú trấn phương Bắc, mang sức mạnh băng giá và sát khí ngút trời.' },

    // Spirit (15%)
    { id: 'p_spirit_1', name: 'Cửu Vĩ Hồ', type: 'Linh Thú', rarity: 'spirit', power: 1500, image: 'https://image.pollinations.ai/prompt/nine%20tailed%20fox%20mystic%20spirit%20white%20fur?width=800&height=600&nologo=true', desc: 'Hồ ly chín đuôi, mị hoặc chúng sinh.' },
    { id: 'p_spirit_2', name: 'Xích Thố', type: 'Linh Thú', rarity: 'spirit', power: 1400, image: 'https://image.pollinations.ai/prompt/red%20hare%20legendary%20horse%20fire%20mane?width=800&height=600&nologo=true', desc: 'Ngựa chiến ngàn dặm, trung thành tuyệt đối.' },

    // Mortal (30%)
    { id: 'p_mortal_1', name: 'Sói Xám', type: 'Phàm Thú', rarity: 'mortal', power: 600, image: 'https://image.pollinations.ai/prompt/grey%20wolf%20wild%20beast%20forest%20night?width=800&height=600&nologo=true', desc: 'Sói hoang dã, nhanh nhẹn và hung dữ.' },
    { id: 'p_mortal_2', name: 'Đại Bàng', type: 'Phàm Thú', rarity: 'mortal', power: 550, image: 'https://image.pollinations.ai/prompt/giant%20eagle%20bird%20prey%20sky%20mountains?width=800&height=600&nologo=true', desc: 'Chúa tể bầu trời, đôi mắt tinh anh.' },
];

export const MISSIONS = [
    { id: 'daily_login', title: 'Đăng Nhập Hàng Ngày', desc: 'Vào game mỗi ngày', target: 1, reward: 1, rewardType: 'mystery_bag' },
    { id: 'watch_60m', title: 'Tu Luyện 1 Giờ', desc: 'Xem phim 60 phút', target: 60 * 60, reward: 200 },
    { id: 'watch_90m', title: 'Tu Luyện 1.5 Giờ', desc: 'Xem phim 90 phút', target: 90 * 60, reward: 300 },
];

import { initializeDatabase } from '../lib/seedData';

export const useGameStore = create((set, get) => ({
    // Authentication state
    user: null,
    session: null,
    loading: true,
    error: null,

    // App state
    selectedMovie: (() => {
        try {
            const stored = localStorage.getItem('selectedMovie');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    })(),
    isPlaying: false,
    movies: [],
    userStats: null,
    dbInitialized: false,

    // Stats state
    characterStats: null,
    activeBuffs: [],
    statsLoading: false,

    // Logs for gamification
    logs: [
        { id: 1, text: 'Chào mừng đạo hữu quay lại Tiên Giới!', type: 'sys' },
        { id: 2, text: 'Tông môn đang triệu tập đệ tử.', type: 'warn' }
    ],

    // Mission State
    todayWatchTime: 0,
    lastLoginDate: null,
    claimedMissions: [],

    // Initialize database with sample data
    initDatabase: async () => {
        if (get().dbInitialized) {
            console.log('✅ Database already initialized');
            return;
        }

        console.log('🚀 Initializing database... (Skipping Supabase seeding)');
        set({ dbInitialized: true });
    },

    // Initialize auth
    initializeAuth: async () => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);

                // Fetch latest user data from API to ensure real-time sync
                try {
                    const response = await fetch(`${API_BASE_URL}/api/users/${parsedUser.id}/home-stats`);
                    if (response.ok) {
                        const latestData = await response.json();
                        // Merge latest data with stored user (preserving avatar/name if not in home-stats, but home-stats usually has them)
                        // Actually home-stats might be limited. Let's assume we need a full profile endpoint or just update what we have.
                        // Ideally we should have /api/users/me or similar. 
                        // For now, let's use the data we get back from login/register which is the full user object.
                        // But since we don't have a dedicated 'get current user' endpoint that returns everything secure, 
                        // we will rely on the fact that we can update the specific fields we care about (stones, mysteryBags, exp, rank).

                        // Let's use the home-stats endpoint which returns { username, rank, exp, stones, mystery_bags, ... }
                        // Note: home-stats might return snake_case.

                        const updatedUser = {
                            ...parsedUser,
                            stones: latestData.stones,
                            mysteryBags: latestData.mystery_bags, // Ensure this maps correctly
                            exp: latestData.exp,
                            rank: latestData.rank,
                            // Update other fields if needed
                        };

                        set({
                            user: updatedUser,
                            session: { user: updatedUser },
                            loading: false
                        });
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        return;
                    }
                } catch (apiError) {
                    console.warn('Failed to fetch latest user data, using stored data:', apiError);
                }

                set({
                    user: parsedUser,
                    session: { user: parsedUser },
                    loading: false
                });
            } else {
                set({ session: null, user: null, loading: false });
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ session: null, user: null, loading: false, error: error.message });
        }
    },

    // Authentication methods
    signIn: async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');

            const apiUser = data.user;
            const user = {
                ...apiUser,
                name: apiUser.username,
                avatar: apiUser.avatar_url
            };
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                session: { user },
                error: null
            });

            return { user };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    signUp: async (email, password, username) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            localStorage.removeItem('user');
            set({
                user: null,
                session: null,
                userStats: null,
                logs: [{ id: Date.now(), text: 'Đã đăng xuất khỏi Tiên Giới!', type: 'sys' }]
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    // Movie methods
    fetchMovies: async () => {
        try {
            const movies = await movieService?.getAllMovies() || [];
            set({ movies });
            return movies;
        } catch (error) {
            console.error('Error fetching movies:', error);
            set({ error: 'Failed to load movies' });
            throw error; // Propagate error to component
        }
    },

    getMoviesByCategory: async (category) => {
        try {
            return await movieService?.getMoviesByCategory(category) || [];
        } catch (error) {
            console.error('Error fetching movies by category:', error);
        }
    },

    searchMovies: async (query, category, minRating, sortBy) => {
        try {
            return await movieService?.searchMovies(query, category, minRating, sortBy) || [];
        } catch (error) {
            console.error('Error searching movies:', error);
        }
    },

    // User methods
    fetchUserStats: async () => {
        const user = get().user;
        if (!user?.id) return;

        try {
            const stats = await userService.getUserStats(user.id);
            set({ userStats: stats });
            return stats;
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    },

    updateUserProfile: async (updates) => {
        const user = get().user;
        if (!user?.id) return;

        try {
            await userService.updateProfile(user.id, updates);
            set({ user: { ...user, ...updates } });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    // App methods
    setUser: (user) => set({ user }),
    setSelectedMovie: (movie) => {
        localStorage.setItem('selectedMovie', JSON.stringify(movie));
        set({ selectedMovie: movie });
    },
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setMovies: (movies) => set({ movies }),

    // Stats methods
    fetchCharacterStats: async () => {
        const user = get().user;
        if (!user?.id) return;

        set({ statsLoading: true });
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${user.id}/stats`);
            const data = await res.json();

            set({
                characterStats: data,
                activeBuffs: data.buffs || [],
                statsLoading: false
            });
            return data;
        } catch (err) {
            console.error('Fetch stats error:', err);
            set({ statsLoading: false });
        }
    },

    refreshStats: async () => {
        await get().fetchCharacterStats();
    },

    applyBuff: async (buffType, buffValue, isPercentage, durationMinutes, sourceType, sourceItemId) => {
        const user = get().user;
        if (!user?.id) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/buffs/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    buffType,
                    buffValue,
                    isPercentage,
                    durationMinutes,
                    sourceType: sourceType || 'pill',
                    sourceItemId
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Refresh stats to get updated totals
                await get().fetchCharacterStats();
                return data.buff;
            }
        } catch (err) {
            console.error('Apply buff error:', err);
            throw err;
        }
    },

    updateExp: (amount) => set((state) => {
        if (!state.user) return state;

        const currentRank = RANKS[state.user.rank];
        if (!currentRank) return state;

        let newExp = state.user.exp + amount;
        let isReady = state.user.is_breakthrough_ready;

        // Check if reached max exp for current rank
        if (newExp >= currentRank.maxExp) {
            newExp = currentRank.maxExp;
            isReady = true;
        }

        const updatedUser = { ...state.user, exp: newExp, is_breakthrough_ready: isReady };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return { user: updatedUser };
    }),

    attemptBreakthrough: async () => {
        const user = get().user;
        if (!user) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/gamification/breakthrough`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // Update user state based on result
            const updatedUser = { ...user };

            if (data.result === 1) {
                // Success
                updatedUser.rank = data.new_rank;
                updatedUser.exp = 0;
                updatedUser.is_breakthrough_ready = false;
                get().addLog(`🎉 ĐỘT PHÁ THÀNH CÔNG! Chúc mừng đạo hữu thăng cấp!`, 'success');
            } else {
                // Fail
                updatedUser.exp = Math.floor(user.exp * 0.7);
                updatedUser.is_breakthrough_ready = false;
                get().addLog(`💥 ĐỘT PHÁ THẤT BẠI! Đạo hữu bị phản phệ, tổn thất tu vi.`, 'error');
            }

            localStorage.setItem('user', JSON.stringify(updatedUser));
            set({ user: updatedUser });
            return data;
        } catch (error) {
            console.error('Breakthrough error:', error);
            throw error;
        }
    },

    addLog: (text, type = 'info') => set((state) => ({
        logs: [{ id: Date.now(), text, type }, ...state.logs]
    })),

    buyItem: (item) => set((state) => {
        if (!state.user) return state;

        if (state.user.stones >= item.price) {
            const updatedUser = {
                ...state.user,
                stones: state.user.stones - item.price
            };

            return {
                user: updatedUser,
                logs: [{
                    id: Date.now(),
                    text: `Đã mua ${item.name}`,
                    type: 'success'
                }, ...state.logs]
            };
        }

        return {
            logs: [{
                id: Date.now(),
                text: `Không đủ linh thạch!`,
                type: 'error'
            }, ...state.logs]
        };
    }),

    // Mission Actions
    checkDailyLogin: () => {
        const today = new Date().toDateString();
        const { lastLoginDate } = get();

        if (lastLoginDate !== today) {
            set({
                lastLoginDate: today,
                todayWatchTime: 0,
                claimedMissions: []
            });
            // Save to local storage
            localStorage.setItem('missionState', JSON.stringify({
                lastLoginDate: today,
                todayWatchTime: 0,
                claimedMissions: []
            }));
        } else {
            // Load from local storage if exists
            const stored = localStorage.getItem('missionState');
            if (stored) {
                set(JSON.parse(stored));
            }
        }
    },

    updateWatchTime: (seconds) => {
        const { todayWatchTime, lastLoginDate, claimedMissions } = get();
        const newTime = todayWatchTime + seconds;

        set({ todayWatchTime: newTime });

        // Persist
        localStorage.setItem('missionState', JSON.stringify({
            lastLoginDate,
            todayWatchTime: newTime,
            claimedMissions
        }));
    },

    claimMissionReward: (missionId) => {
        const { user, claimedMissions, todayWatchTime } = get();
        if (!user) return;

        const mission = MISSIONS.find(m => m.id === missionId);
        if (!mission) return;

        // Check conditions
        if (claimedMissions.includes(missionId)) return;

        let isCompleted = false;
        if (missionId === 'daily_login') isCompleted = true;
        else isCompleted = todayWatchTime >= mission.target;

        if (!isCompleted) return;

        // Reward Logic
        let updatedUser = { ...user };
        let logText = '';

        if (mission.rewardType === 'mystery_bag') {
            updatedUser.mysteryBags = (updatedUser.mysteryBags || 0) + mission.reward;
            logText = `Đã nhận thưởng nhiệm vụ: ${mission.title} (+${mission.reward} Túi Thần Bí)`;
        } else {
            updatedUser.stones = user.stones + mission.reward;
            logText = `Đã nhận thưởng nhiệm vụ: ${mission.title} (+${mission.reward} Linh Thạch)`;
        }

        const newClaimed = [...claimedMissions, missionId];

        set({
            user: updatedUser,
            claimedMissions: newClaimed,
            logs: [{
                id: Date.now(),
                text: logText,
                type: 'success'
            }, ...get().logs]
        });

        // Persist
        localStorage.setItem('user', JSON.stringify(updatedUser));
        const { lastLoginDate } = get();
        localStorage.setItem('missionState', JSON.stringify({
            lastLoginDate,
            todayWatchTime,
            claimedMissions: newClaimed
        }));
    },

    // Pet System Actions
    activePet: null,

    fetchUserPet: async () => {
        const user = get().user;
        if (!user) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/pets/user/${user.id}`);
            if (response.ok) {
                const pet = await response.json();
                // Parse stats if it's a string (from DB)
                if (pet && typeof pet.stats === 'string') {
                    pet.stats = JSON.parse(pet.stats);
                }
                set({ activePet: pet });
                return pet;
            }
        } catch (error) {
            console.error('Error fetching pet:', error);
        }
    },

    hatchPet: async (name, species, element) => {
        const user = get().user;
        if (!user) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/pets/hatch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, name, species, element })
            });
            const pet = await response.json();
            if (pet && typeof pet.stats === 'string') {
                pet.stats = JSON.parse(pet.stats);
            }
            set({ activePet: pet });
            get().addLog(`🥚 Đã ấp nở thành công linh thú: ${pet.name}!`, 'success');
            return pet;
        } catch (error) {
            console.error('Error hatching pet:', error);
            throw error;
        }
    },

    feedPet: async (petId, expAmount, bondAmount) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/pets/feed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ petId, expAmount, bondAmount })
            });
            const updatedPet = await response.json();
            if (updatedPet && typeof updatedPet.stats === 'string') {
                updatedPet.stats = JSON.parse(updatedPet.stats);
            }
            set({ activePet: updatedPet });
            get().addLog(`🍖 Linh thú đã ăn no! (+${expAmount} EXP)`, 'success');
            return updatedPet;
        } catch (error) {
            console.error('Error feeding pet:', error);
        }
    },

    breakthroughPet: async (petId, newTier, newVisualUrl) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/pets/breakthrough`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ petId, newTier, newVisualUrl })
            });
            const updatedPet = await response.json();
            if (updatedPet && typeof updatedPet.stats === 'string') {
                updatedPet.stats = JSON.parse(updatedPet.stats);
            }
            set({ activePet: updatedPet });
            get().addLog(`🔥 ĐỘT PHÁ THÀNH CÔNG! Linh thú đã tiến hóa!`, 'success');
            return updatedPet;
        } catch (error) {
            console.error('Error evolving pet:', error);
        }
    },

    openMysteryBag: () => {
        const { user } = get();
        if (!user || !user.mysteryBags || user.mysteryBags <= 0) return null;

        // Decrease bag count
        const updatedUser = { ...user, mysteryBags: user.mysteryBags - 1 };

        // RNG Logic
        const rand = Math.random() * 100;
        let result = null;
        let type = '';

        if (rand < 1) { // 1% Divine
            const pool = PET_DATA.filter(p => p.rarity === 'divine');
            result = pool[Math.floor(Math.random() * pool.length)];
            type = 'pet';
        } else if (rand < 6) { // 5% Saint
            const pool = PET_DATA.filter(p => p.rarity === 'saint');
            result = pool[Math.floor(Math.random() * pool.length)];
            type = 'pet';
        } else if (rand < 21) { // 15% Spirit
            const pool = PET_DATA.filter(p => p.rarity === 'spirit');
            result = pool[Math.floor(Math.random() * pool.length)];
            type = 'pet';
        } else if (rand < 51) { // 30% Mortal
            const pool = PET_DATA.filter(p => p.rarity === 'mortal');
            result = pool[Math.floor(Math.random() * pool.length)];
            type = 'pet';
        } else { // 49% Stones
            const stones = Math.floor(Math.random() * 401) + 100; // 100-500
            result = { name: `${stones} Linh Thạch`, stones, rarity: 'common', image: 'https://cdn-icons-png.flaticon.com/512/214/214305.png' }; // Simple stone icon
            type = 'stones';
            updatedUser.stones += stones;
        }

        if (type === 'pet') {
            // Add pet to inventory (simple array for now)
            updatedUser.inventory = updatedUser.inventory || [];
            updatedUser.inventory.push(result);
        }

        set({
            user: updatedUser,
            logs: [{
                id: Date.now(),
                text: `Đã mở Túi Thần Bí: Nhận được ${result.name}`,
                type: 'success'
            }, ...get().logs]
        });

        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { result, type };
    }
}));
