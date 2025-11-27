require('dotenv').config();
const fetch = require('node-fetch');
if (!global.fetch) {
    global.fetch = fetch;
    global.Headers = fetch.Headers;
    global.Request = fetch.Request;
    global.Response = fetch.Response;
}
const express = require('express');
const cors = require('cors');
const { supabase } = require('./config/supabase'); // Use Supabase
const pvpRoutes = require('./routes/pvp_routes');

const http = require('http');
const { initializeSocket } = require('./config/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;


// Initialize Socket.io
initializeSocket(server);

// Import Middlewares
const { requireAuth, verifyOwnership, optionalAuth, requireAdmin } = require('./middleware/auth');
const { apiLimiter, authLimiter, actionLimiter, pvpLimiter } = require('./middleware/rateLimiter');
const { sanitizeQuery } = require('./middleware/validation');

// Middleware
app.use(cors());
app.use(express.json());

// Apply global rate limiter to all API routes
app.use('/api/', apiLimiter);

// Sanitize all query parameters globally
app.use(sanitizeQuery);

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PvP Routes (with PvP rate limiter)
app.use('/api/pvp', pvpLimiter, optionalAuth, pvpRoutes);

// Sect Routes (authenticated)
app.use('/api/sects', requireAuth, require('./routes/sect_routes').router);

// Upload Routes (authenticated + admin for some)
console.log('Registering upload routes...');
app.use('/api/upload', requireAuth, require('./routes/upload_routes'));

// Stats & Buff Routes (authenticated + ownership verification)
app.use('/api/users/:userId', requireAuth, verifyOwnership, require('./routes/stats_routes'));
app.use('/api/buffs', requireAuth, require('./routes/buff_routes'));

// Alchemy Routes (authenticated + action limiter for crafting)
app.use('/api/alchemy', requireAuth, actionLimiter, require('./routes/alchemy_routes'));
console.log('Stats and Buff routes loaded');
console.log('Alchemy routes loaded');

// Helper to convert PascalCase to snake_case
const toSnakeCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => toSnakeCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
            result[snakeKey] = toSnakeCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
};

// Watch History Route
app.get('/api/watch-history/:userId/:movieId', async (req, res) => {
    const { userId, movieId } = req.params;
    try {
        const { data, error } = await supabase
            .from('WatchHistory')
            .select('ProgressSeconds, EpisodeId')
            .eq('UserId', userId)
            .eq('MovieId', movieId)
            .maybeSingle();

        if (error) throw error;

        if (data) {
            res.json(toSnakeCase(data));
        } else {
            res.json({ progress_seconds: 0, episode_id: null });
        }
    } catch (err) {
        console.error('WatchHistory Error:', err);
        res.json({ progress_seconds: 0, episode_id: null });
    }
});

// Recommendations Route (ensure it exists)
app.get('/api/movies/:id/recommendations', (req, res) => {
    res.json([]);
});

// Routes
app.get('/', (req, res) => {
    res.send('Tien Gioi API is running (Supabase)');
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        // Check if user exists
        const { data: existingUser } = await supabase
            .from('Users')
            .select('Id')
            .eq('Username', username)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Insert User
        const { data, error } = await supabase
            .from('Users')
            .insert({
                Username: username,
                PasswordHash: password,
                Email: email,
                AvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + username,
                Rank: 0,
                Exp: 0,
                Stones: 100,
                SectId: 1
            })
            .select()
            .single();

        if (error) throw error;

        res.json(toSnakeCase({ message: 'User registered successfully', userId: data.Id }));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { data: user, error } = await supabase
            .from('Users')
            .select('*')
            .eq('Username', username)
            .maybeSingle();

        if (error) throw error;

        console.log('Login Attempt:', { username });

        if (!user || user.PasswordHash !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ user: toSnakeCase(user) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Movie Routes
app.get('/api/movies', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Movies')
            .select('*')
            .order('Rating', { ascending: false });

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/movies', async (req, res) => {
    console.log('POST /api/movies request received', req.body);
    const { title, description, cover_image, video_url, category, episode_count } = req.body;
    try {
        const { data, error } = await supabase
            .from('Movies')
            .insert({
                Title: title,
                Description: description,
                CoverImage: cover_image,
                VideoUrl: video_url,
                Category: category,
                EpisodeCount: episode_count || 0
            })
            .select()
            .single();

        if (error) throw error;
        console.log('Add Movie Result:', data);
        res.json(toSnakeCase({ id: data.Id }));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/movies/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, cover_image, video_url, category } = req.body;
    try {
        const { data, error } = await supabase
            .from('Movies')
            .update({
                Title: title,
                Description: description,
                CoverImage: cover_image,
                VideoUrl: video_url,
                Category: category
            })
            .eq('Id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error, count } = await supabase
            .from('Movies')
            .delete({ count: 'exact' })
            .eq('Id', id);

        if (error) throw error;
        res.json({ deletedCount: count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/pets/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabase
            .from('Pets')
            .select('*')
            .eq('UserId', userId)
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (data) {
            res.json(toSnakeCase(data));
        } else {
            res.json(null);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/pets/breakthrough', async (req, res) => {
    const { petId } = req.body;
    try {
        // 1. Get Pet
        const { data: pet, error: petError } = await supabase
            .from('Pets')
            .select('*')
            .eq('Id', petId)
            .single();

        if (petError) throw petError;

        // 2. Logic for Breakthrough (Simplified)
        // Increase Tier, Reset Level, Boost Stats
        const newTier = (pet.Tier || 0) + 1;
        const newStats = JSON.parse(pet.Stats || '{}');

        // Boost stats by 20%
        for (let key in newStats) {
            newStats[key] = Math.floor(newStats[key] * 1.2);
        }

        // 3. Update Pet
        const { data: updatedPet, error: updateError } = await supabase
            .from('Pets')
            .update({
                Tier: newTier,
                Stats: JSON.stringify(newStats),
                Level: 1,
                Exp: 0
            })
            .eq('Id', petId)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json(toSnakeCase(updatedPet));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/pets/feed', async (req, res) => {
    const { petId, expAmount, bondAmount } = req.body;
    try {
        // Fetch current pet to get stats
        const { data: pet, error: fetchError } = await supabase
            .from('Pets')
            .select('*')
            .eq('Id', petId)
            .single();

        if (fetchError) throw fetchError;

        // Calculate new stats (simplified logic, ideally use RPC for atomic update)
        const newExp = (pet.Exp || 0) + expAmount;
        const newBond = (pet.Bond || 0) + bondAmount;

        const { data, error } = await supabase
            .from('Pets')
            .update({ Exp: newExp, Bond: newBond })
            .eq('Id', petId)
            .select()
            .single();

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/pets/hatch', async (req, res) => {
    const { userId, name, species, element } = req.body;
    try {
        // 1. Generate Initial Visual URL
        const prompt = `mystical ${element} ${species} baby egg hatching cute fantasy art?width=800&height=800&nologo=true`;
        const visualUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

        // 2. Initial Stats (Tier 0)
        const stats = { atk: 10, def: 10, hp: 100, spd: 10, cri: 5 };

        // 3. Initial Skills (Tier 0)
        let skills = [];
        if (species === 'Tiger') {
            skills.push({ name: "Băng Trảo", desc: "Táp gây sát thương băng và làm chậm (kèm Hàn Ấn).", type: "Active", unlockedAt: 0 });
            skills.push({ name: "Tuyết Mệnh", desc: "Nhận khiên băng khi máu dưới 30%.", type: "Passive", unlockedAt: 0 });
        }
        else if (species === 'Phoenix') skills.push({ name: "Hỏa Linh Châm", desc: "Gây sát thương đốt cháy nhẹ.", type: "Active", unlockedAt: 0 });

        // 4. Determine Rarity
        let rarity = 'Mortal';
        if (species === 'Dragon' || species === 'Phoenix') rarity = 'Divine';
        else if (species === 'Tiger') rarity = 'Saint';
        else if (species === 'Fox') rarity = 'Spirit';

        // 5. Insert into Supabase
        const { data, error } = await supabase
            .from('Pets')
            .insert({
                UserId: userId,
                Name: name,
                Species: species,
                Element: element,
                Rarity: rarity,
                VisualUrl: visualUrl,
                Stats: JSON.stringify(stats),
                Skills: JSON.stringify(skills),
                Tier: 0,
                Level: 1,
                Exp: 0,
                Bond: 0,
                Mood: 'Happy',
                Elo: 1000,
                Wins: 0,
                Losses: 0
            })
            .select()
            .single();

        if (error) throw error;

        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        const fs = require('fs');
        fs.writeFileSync('server/error.log', err.toString() + '\n' + (err.stack || ''));
        res.status(500).json({ message: 'Server error', error: err.toString() });
    }
});

app.get('/api/pets/species', (req, res) => {
    const species = [
        { id: 'Dragon', name: 'Chân Long', desc: 'Uy mãnh vô song, chúa tể bầu trời.', element: 'Lôi' },
        { id: 'Phoenix', name: 'Chu Tước', desc: 'Tái sinh từ tro tàn, sở hữu ngọn lửa bất diệt và khả năng hồi sinh.', element: 'Hỏa' },
        { id: 'Tiger', name: 'Bạch Hổ', desc: 'Tuyết Vực Trấn Bắc – Hàn Thiên Chi Vương.', element: 'Băng' },
        { id: 'Fox', name: 'Cửu Vĩ Hồ', desc: 'Mị hoặc chúng sinh, linh lực vô biên.', element: 'Tâm' },
    ];
    res.json(toSnakeCase(species));
});

app.get('/api/movies/top-rated', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Movies')
            .select('*')
            .order('Rating', { ascending: false })
            .limit(10); // Assuming top rated means top 10

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/movies/categories', async (req, res) => {
    try {
        // Distinct categories? Supabase doesn't support distinct easily on select?
        // Actually it does: .select('Category', { count: 'exact', head: false }).distinct() ? No.
        // We can fetch all and distinct in JS, or use RPC.
        // For now, let's fetch all movies and extract categories.
        const { data, error } = await supabase
            .from('Movies')
            .select('Category');

        if (error) throw error;

        const categories = [...new Set(data.map(m => m.Category))].filter(Boolean).map(c => ({ category: c }));
        res.json(toSnakeCase(categories));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/movies/trending', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Movies')
            .select('*')
            .order('Views', { ascending: false })
            .limit(10);

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/movies/new', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Movies')
            .select('*')
            .order('CreatedAt', { ascending: false })
            .limit(10);

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('Movies')
            .select('*')
            .eq('Id', id)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data: user, error } = await supabase
            .from('Users')
            .select('Id, Username, Email, AvatarUrl, Rank, Exp, Stones, CreatedAt, SectId')
            .eq('Id', id)
            .single();

        if (error) throw error;

        // Transform for frontend consistency (if needed)
        // Frontend expects: name, email, avatar, rank, exp, stones, created_at
        const result = {
            id: user.Id,
            name: user.Username,
            email: user.Email,
            avatar: user.AvatarUrl,
            rank: user.Rank,
            exp: user.Exp,
            stones: user.Stones,
            created_at: user.CreatedAt,
            sect_id: user.SectId
        };

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/:id/home-stats', async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch user stats manually
        const { data: user, error } = await supabase
            .from('Users')
            .select('Rank, Exp, Stones, MysteryBags')
            .eq('Id', id)
            .single();

        if (error) throw error;
        res.json(toSnakeCase(user));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Movie Comments
app.get('/api/movies/:id/comments', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('Comments')
            .select('*, Users(Username, AvatarUrl, Rank)')
            .eq('MovieId', id)
            .is('ParentCommentId', null)
            .order('CreatedAt', { ascending: false });

        if (error) throw error;

        // Flatten the Users object into the comment object to match previous structure
        const flattened = data.map(c => ({
            ...c,
            Username: c.Users.Username,
            AvatarUrl: c.Users.AvatarUrl,
            Rank: c.Users.Rank
        }));

        res.json(toSnakeCase(flattened));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Comment
app.post('/api/comments', async (req, res) => {
    const { userId, movieId, content, parentCommentId } = req.body;
    try {
        const { data, error } = await supabase
            .from('Comments')
            .insert({
                UserId: userId,
                MovieId: movieId,
                Content: content,
                ParentCommentId: parentCommentId || null
            })
            .select()
            .single();

        if (error) throw error;
        res.json(toSnakeCase({ commentId: data.Id }));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Like Comment
app.post('/api/comments/:id/like', async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch current likes
        const { data: comment, error: fetchError } = await supabase
            .from('Comments')
            .select('Likes')
            .eq('Id', id)
            .single();

        if (fetchError) throw fetchError;

        const { data, error } = await supabase
            .from('Comments')
            .update({ Likes: (comment.Likes || 0) + 1 })
            .eq('Id', id)
            .select()
            .single();

        if (error) throw error;
        res.json({ likes: data.Likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Comment
app.delete('/api/comments/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        const { error, count } = await supabase
            .from('Comments')
            .delete({ count: 'exact' })
            .eq('Id', id)
            .eq('UserId', userId);

        if (error) throw error;

        if (count > 0) {
            res.json({ success: true });
        } else {
            res.status(403).json({ message: 'Unauthorized or comment not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Notifications
app.get('/api/users/:id/notifications', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('Notifications')
            .select('*')
            .eq('UserId', id)
            .order('CreatedAt', { ascending: false });

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Movie Views
app.post('/api/movies/:id/views', async (req, res) => {
    const { id } = req.params;
    try {
        const { data: movie, error: fetchError } = await supabase
            .from('Movies')
            .select('Views')
            .eq('Id', id)
            .single();

        if (fetchError) throw fetchError;

        await supabase
            .from('Movies')
            .update({ Views: (movie.Views || 0) + 1 })
            .eq('Id', id);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Market Routes
app.get('/api/items', async (req, res) => {
    try {
        const { data, error } = await supabase.from('Items').select('*');
        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/:id/inventory', async (req, res) => {
    const { id } = req.params;
    try {
        // Get user inventory (changed from UserItems to UserInventory)
        const { data: inventoryData, error: invError } = await supabase
            .from('UserInventory')
            .select('*')
            .eq('UserId', id);

        if (invError) throw invError;

        // If no inventory, return empty array
        if (!inventoryData || inventoryData.length === 0) {
            return res.json([]);
        }

        // Get all items manually (since Supabase can't auto-join)
        const itemIds = inventoryData.map(inv => inv.ItemId);
        const { data: itemsData, error: itemsError } = await supabase
            .from('Items')
            .select('*')
            .in('Id', itemIds);

        if (itemsError) throw itemsError;

        // Create a map of items for easy lookup
        const itemsMap = {};
        itemsData.forEach(item => {
            itemsMap[item.Id] = item;
        });

        // Combine inventory with item details
        const flattened = inventoryData.map(inv => {
            const item = itemsMap[inv.ItemId] || {};
            return {
                Id: inv.Id,
                ItemId: inv.ItemId,
                Quantity: inv.Quantity,
                Name: item.Name || 'Unknown Item',
                Description: item.Description || '',
                Icon: item.IconUrl || '',
                Type: item.Type || ''
            };
        });

        res.json(toSnakeCase(flattened));
    } catch (err) {
        console.error('Inventory error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get user's active buffs (moved from item_usage_routes.js)
app.get('/api/users/:userId/buffs', async (req, res) => {
    try {
        const { userId } = req.params;

        // Delete expired buffs first
        await supabase
            .from('UserBuffs')
            .delete()
            .lt('ExpiresAt', new Date().toISOString())
            .not('ExpiresAt', 'is', null);

        // Get active buffs (removed auto-join which doesn't work)
        const { data: buffs, error } = await supabase
            .from('UserBuffs')
            .select('*')
            .eq('UserId', userId)
            .eq('Active', true)
            .or(`ExpiresAt.is.null,ExpiresAt.gt.${new Date().toISOString()}`);

        if (error) {
            console.error('Get buffs error:', error);
            throw error;
        }

        // Get item details manually if buffs exist
        let itemsMap = {};
        if (buffs && buffs.length > 0) {
            const itemIds = buffs.map(b => b.SourceItemId).filter(Boolean);
            if (itemIds.length > 0) {
                const { data: itemsData } = await supabase
                    .from('Items')
                    .select('Id, Name, IconUrl')
                    .in('Id', itemIds);

                if (itemsData) {
                    itemsData.forEach(item => {
                        itemsMap[item.Id] = item;
                    });
                }
            }
        }

        // Calculate remaining time
        const buffsList = (buffs || []).map(buff => {
            const item = itemsMap[buff.SourceItemId] || {};
            return {
                id: buff.Id,
                type: buff.BuffType,
                value: buff.BuffValue,
                isPercentage: buff.IsPercentage,
                appliedAt: buff.AppliedAt,
                expiresAt: buff.ExpiresAt,
                itemName: item.Name || buff.BuffType.toUpperCase(),
                itemIcon: item.IconUrl || '',
                remainingSeconds: buff.ExpiresAt
                    ? Math.max(0, Math.floor((new Date(buff.ExpiresAt) - new Date()) / 1000))
                    : null
            };
        });

        res.json({ buffs: buffsList });

    } catch (err) {
        console.error('Get buffs error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

app.post('/api/market/buy', async (req, res) => {
    const { userId, itemId } = req.body;
    try {
        // 1. Get Item Price
        const { data: item } = await supabase.from('Items').select('Price').eq('Id', itemId).single();
        if (!item) return res.status(400).json({ success: false, message: 'Item not found' });

        // 2. Get User Stones
        const { data: user } = await supabase.from('Users').select('Stones').eq('Id', userId).single();
        if (!user) return res.status(400).json({ success: false, message: 'User not found' });

        if (user.Stones < item.Price) {
            return res.json(toSnakeCase({ success: false, message: 'Not enough stones' }));
        }

        // 3. Deduct Stones
        await supabase.from('Users').update({ Stones: user.Stones - item.Price }).eq('Id', userId);

        // 4. Add to Inventory (Upsert logic: increment if exists)
        // FIXED: Changed from UserItems to UserInventory
        const { data: existingItem } = await supabase
            .from('UserInventory')
            .select('Quantity')
            .eq('UserId', userId)
            .eq('ItemId', itemId)
            .maybeSingle();

        if (existingItem) {
            await supabase
                .from('UserInventory')
                .update({ Quantity: existingItem.Quantity + 1 })
                .eq('UserId', userId)
                .eq('ItemId', itemId);
        } else {
            await supabase
                .from('UserInventory')
                .insert({ UserId: userId, ItemId: itemId, Quantity: 1 });
        }

        // 5. Log Transaction (optional, check if table exists)
        // await supabase.from('Transactions').insert({ UserId: userId, ItemId: itemId, Price: item.Price });

        res.json(toSnakeCase({ success: true, message: 'Purchase successful', newBalance: user.Stones - item.Price }));
    } catch (err) {
        console.error('Market buy error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Episode Routes
app.get('/api/movies/:id/episodes', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('Episodes')
            .select('*')
            .eq('MovieId', id)
            .order('EpisodeNumber', { ascending: true });

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/episodes', async (req, res) => {
    const { movie_id, title, episode_number, video_url, duration } = req.body;
    try {
        const { data, error } = await supabase
            .from('Episodes')
            .insert({
                MovieId: movie_id,
                Title: title,
                EpisodeNumber: episode_number,
                VideoUrl: video_url,
                Duration: duration || 0
            })
            .select()
            .single();

        if (error) throw error;
        res.json(toSnakeCase({ id: data.Id }));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/episodes/:id', async (req, res) => {
    const { id } = req.params;
    const { title, episode_number, video_url, duration } = req.body;
    try {
        const { error } = await supabase
            .from('Episodes')
            .update({
                Title: title,
                EpisodeNumber: episode_number,
                VideoUrl: video_url,
                Duration: duration || 0
            })
            .eq('Id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/episodes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('Episodes')
            .delete()
            .eq('Id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, rank, exp, stones, mysteryBags } = req.body;
    try {
        const { data, error } = await supabase
            .from('Users')
            .update({
                Username: username,
                Rank: rank,
                Exp: exp,
                Stones: stones,
                MysteryBags: mysteryBags || 0
            })
            .eq('Id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('Users')
            .delete()
            .eq('Id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Favorites Routes
app.post('/api/favorites', async (req, res) => {
    const { userId, movieId } = req.body;
    try {
        const { error } = await supabase
            .from('Favorites')
            .insert({ UserId: userId, MovieId: movieId });

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/favorites/:userId/:movieId', async (req, res) => {
    const { userId, movieId } = req.params;
    try {
        const { error } = await supabase
            .from('Favorites')
            .delete()
            .eq('UserId', userId)
            .eq('MovieId', movieId);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/:id/favorites', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('Favorites')
            .select('*, Movies(*)')
            .eq('UserId', id);

        if (error) throw error;

        // Transform to match expected format (flatten Movies)
        const result = data.map(f => ({
            ...f.Movies,
            FavoriteId: f.Id,
            FavoritedAt: f.CreatedAt
        }));

        res.json(toSnakeCase(result));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/:userId/favorites/:movieId', async (req, res) => {
    const { userId, movieId } = req.params;
    try {
        const { data, error } = await supabase
            .from('Favorites')
            .select('Id')
            .eq('UserId', userId)
            .eq('MovieId', movieId)
            .maybeSingle();

        if (error) throw error;
        res.json({ is_favorite: !!data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Watch History Routes
app.post('/api/watch-history', async (req, res) => {
    const { userId, movieId, episodeId, progressSeconds } = req.body;
    try {
        // Upsert logic
        const { error } = await supabase
            .from('WatchHistory')
            .upsert({
                UserId: userId,
                MovieId: movieId,
                EpisodeId: episodeId || null,
                ProgressSeconds: progressSeconds,
                WatchedAt: new Date()
            }, { onConflict: 'UserId, MovieId' });

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('WatchHistory')
            .select('*, Movies(*), Episodes(*)')
            .eq('UserId', id)
            .order('WatchedAt', { ascending: false });

        if (error) throw error;

        // Transform
        const result = data.map(h => ({
            ...h.Movies,
            EpisodeNumber: h.Episodes?.EpisodeNumber,
            EpisodeTitle: h.Episodes?.Title,
            ProgressSeconds: h.ProgressSeconds,
            WatchedAt: h.WatchedAt,
            LastWatchedAt: h.WatchedAt, // Alias for frontend
            Duration: h.Episodes?.Duration || 0 // Include duration
        }));

        res.json(toSnakeCase(result));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Playlist Routes
// Playlist Routes (Disabled - Table Missing)
app.get('/api/users/:id/playlists', async (req, res) => {
    res.json([]);
});

app.post('/api/playlists', async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});

app.post('/api/playlists/:id/movies', async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
});

app.get('/api/playlists/:id/movies', async (req, res) => {
    res.json([]);
});

// Gamification Routes
// Gamification Routes
// Gamification Routes
app.get('/api/leaderboard/level', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .select('Username, Rank, Exp, AvatarUrl')
            .order('Rank', { ascending: false })
            .order('Exp', { ascending: false })
            .limit(10);

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/leaderboard/wealth', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Users')
            .select('Username, Stones, AvatarUrl')
            .order('Stones', { ascending: false })
            .limit(10);

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/leaderboard/mounts', async (req, res) => {
    try {
        // Placeholder: Top pets by Elo
        const { data, error } = await supabase
            .from('Pets')
            .select('Name, Elo, VisualUrl, Users(Username)')
            .order('Elo', { ascending: false })
            .limit(10);

        if (error) throw error;

        const result = data.map(p => ({
            Username: p.Users?.Username,
            PetName: p.Name,
            Elo: p.Elo,
            VisualUrl: p.VisualUrl
        }));

        res.json(toSnakeCase(result));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    // Default to level
    try {
        const { data, error } = await supabase
            .from('Users')
            .select('Username, Rank, Exp, AvatarUrl')
            .order('Rank', { ascending: false })
            .order('Exp', { ascending: false })
            .limit(10);

        if (error) throw error;
        res.json(toSnakeCase(data));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ========== VIP SYSTEM ==========

// Get VIP status
app.get('/api/vip/status/:userId', async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('Users')
            .select('VipStatus, VipExpiresAt, LastVipClaim')
            .eq('Id', req.params.userId)
            .single();

        if (error) throw error;
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if monthly VIP expired
        if (user.VipStatus === 'monthly' && user.VipExpiresAt) {
            if (new Date(user.VipExpiresAt) < new Date()) {
                // Expired - reset to none
                await supabase
                    .from('Users')
                    .update({ VipStatus: 'none', VipExpiresAt: null })
                    .eq('Id', req.params.userId);

                return res.json({ vipStatus: 'none', expiresAt: null });
            }
        }

        res.json({
            vipStatus: user.VipStatus || 'none',
            expiresAt: user.VipExpiresAt,
            lastClaim: user.LastVipClaim
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Purchase VIP
app.post('/api/vip/purchase', async (req, res) => {
    try {
        const { userId, vipType } = req.body; // 'monthly' or 'lifetime'

        if (!['monthly', 'lifetime'].includes(vipType)) {
            return res.status(400).json({ message: 'Invalid VIP type' });
        }

        const costs = { monthly: 200, lifetime: 2000 };
        const cost = costs[vipType];

        // Get user
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('Stones')
            .eq('Id', userId)
            .single();

        if (userError) throw userError;
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.Stones < cost) {
            return res.status(400).json({ message: 'Not enough stones' });
        }

        // Calculate expiry
        const expiresAt = vipType === 'monthly'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
            : null; // lifetime = no expiry

        // Deduct stones and set VIP
        const { error: updateError } = await supabase
            .from('Users')
            .update({
                Stones: user.Stones - cost,
                VipStatus: vipType,
                VipExpiresAt: expiresAt
            })
            .eq('Id', userId);

        if (updateError) throw updateError;

        res.json({
            message: `VIP ${vipType} activated successfully!`,
            vipStatus: vipType,
            expiresAt,
            stonesRemaining: user.Stones - cost
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Claim daily VIP stones
app.post('/api/vip/daily-claim', async (req, res) => {
    try {
        const { userId } = req.body;

        // Get user VIP status
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('VipStatus, LastVipClaim, Stones')
            .eq('Id', userId)
            .single();

        if (userError) throw userError;
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.VipStatus === 'none') {
            return res.status(400).json({ message: 'Not a VIP member' });
        }

        // Check if already claimed today
        if (user.LastVipClaim) {
            const lastClaim = new Date(user.LastVipClaim);
            const now = new Date();
            const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);

            if (hoursSinceLastClaim < 24) {
                const hoursRemaining = Math.ceil(24 - hoursSinceLastClaim);
                return res.status(400).json({
                    message: `Already claimed today. Next claim in ${hoursRemaining} hours`,
                    hoursRemaining
                });
            }
        }

        // Calculate daily stones
        const dailyStones = user.VipStatus === 'lifetime' ? 200 : 100;

        // Give stones
        const { error: updateError } = await supabase
            .from('Users')
            .update({
                Stones: user.Stones + dailyStones,
                LastVipClaim: new Date().toISOString()
            })
            .eq('Id', userId);

        if (updateError) throw updateError;

        res.json({
            message: 'Daily VIP stones claimed!',
            amount: dailyStones,
            newTotal: user.Stones + dailyStones
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function to calculate VIP EXP multiplier
function getVipExpMultiplier(vipStatus) {
    if (vipStatus === 'lifetime') return 2.0;
    if (vipStatus === 'monthly') return 1.5;
    return 1.0;
}

// Duplicate routes removed




// ============================================
// INVENTORY SYSTEM
// ============================================

// Get user's inventory
app.get('/api/users/:userId/inventory', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('!!! EXECUTING INVENTORY ENDPOINT !!!');
        // return res.json({ message: "DEBUG MODE" }); // Uncomment to force return

        // 1. Get raw inventory
        const { data: inventoryItems, error: invError } = await supabase
            .from('UserInventory')
            .select('*')
            .eq('UserId', userId);

        if (invError) {
            console.error('Inventory fetch failed:', invError);
            return res.status(500).json({ message: 'Inventory error', error: invError.message });
        }

        if (!inventoryItems || inventoryItems.length === 0) {
            return res.json([]);
        }

        // 2. Get item details
        const itemIds = inventoryItems.map(i => i.ItemId);
        const { data: items, error: itemsError } = await supabase
            .from('Items')
            .select('*')
            .in('Id', itemIds);

        if (itemsError) {
            console.error('Items fetch failed:', itemsError);
            return res.status(500).json({ message: 'Items error', error: itemsError.message });
        }

        // 3. Merge data
        const inventory = inventoryItems.map(invItem => {
            const itemDetails = items.find(i => i.Id === invItem.ItemId);
            return {
                id: invItem.ItemId,
                name: itemDetails?.Name || 'Unknown Item',
                type: itemDetails?.Type,
                rarity: itemDetails?.Rarity,
                effect: itemDetails?.Effect,
                iconUrl: itemDetails?.IconUrl,
                description: itemDetails?.Description,
                quantity: invItem.Quantity
            };
        });

        res.json(inventory);

    } catch (err) {
        console.error('Get inventory error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ============================================
// ITEM USAGE SYSTEM
// ============================================

// Use an item (pill, consumable, etc.)
app.post('/api/items/use', async (req, res) => {
    try {
        const { userId, itemId, quantity = 1 } = req.body;

        if (!userId || !itemId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get item details
        const { data: item, error: itemError } = await supabase
            .from('Items')
            .select('*')
            .eq('Id', itemId)
            .single();

        if (itemError || !item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check user has item in inventory
        const { data: inventoryItem, error: invError } = await supabase
            .from('UserInventory')
            .select('Quantity')
            .eq('UserId', userId)
            .eq('ItemId', itemId)
            .single();

        if (invError || !inventoryItem || inventoryItem.Quantity < quantity) {
            return res.status(400).json({ message: 'Not enough items in inventory' });
        }

        // Get user current stats
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('Exp, Rank, Stones')
            .eq('Id', userId)
            .single();

        if (userError) throw userError;

        let effect = {};
        let updateData = {};

        // Apply effect based on item type
        switch (item.Type) {
            case 'pill_exp':
                // EXP Pill - instant EXP gain
                const expGain = parseInt(item.Effect) || 100;
                updateData.Exp = user.Exp + expGain;
                effect = {
                    type: 'exp',
                    value: expGain,
                    message: `Gained ${expGain} EXP!`
                };
                break;

            case 'pill_hp':
            case 'pill_atk':
            case 'pill_def':
            case 'pill_spd':
                // Buff pills - create temporary buff
                const buffType = item.Type.replace('pill_', '');
                const buffValue = parseInt(item.Effect) || 20; // Default 20%
                const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

                const { error: buffError } = await supabase
                    .from('UserBuffs')
                    .insert({
                        UserId: userId,
                        BuffType: buffType,
                        BuffValue: buffValue,
                        IsPercentage: true,
                        ExpiresAt: expiresAt.toISOString(),
                        SourceItemId: itemId,
                        Active: true
                    });

                if (buffError) throw buffError;

                effect = {
                    type: 'buff',
                    buffType: buffType,
                    value: buffValue,
                    duration: 1800,
                    message: `${buffType.toUpperCase()} increased by ${buffValue}% for 30 minutes!`
                };
                break;

            default:
                return res.status(400).json({ message: 'Unknown item type' });
        }

        // Update user if needed
        if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
                .from('Users')
                .update(updateData)
                .eq('Id', userId);

            if (updateError) throw updateError;
        }

        // Remove item from inventory
        const newQuantity = inventoryItem.Quantity - quantity;
        if (newQuantity <= 0) {
            await supabase
                .from('UserInventory')
                .delete()
                .eq('UserId', userId)
                .eq('ItemId', itemId);
        } else {
            await supabase
                .from('UserInventory')
                .update({ Quantity: newQuantity })
                .eq('UserId', userId)
                .eq('ItemId', itemId);
        }

        // Log usage
        await supabase
            .from('ItemUsageLog')
            .insert({
                UserId: userId,
                ItemId: itemId,
                Quantity: quantity,
                EffectApplied: JSON.stringify(effect),
                Success: true
            });

        // Get updated stats
        const { data: updatedUser } = await supabase
            .from('Users')
            .select('Exp, Rank, Stones')
            .eq('Id', userId)
            .single();

        res.json({
            success: true,
            effect,
            updatedStats: updatedUser,
            remainingQuantity: newQuantity > 0 ? newQuantity : 0
        });

    } catch (err) {
        console.error('Item usage error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's active buffs
app.get('/api/users/:userId/buffs', async (req, res) => {
    try {
        const { userId } = req.params;

        // Delete expired buffs first
        await supabase
            .from('UserBuffs')
            .delete()
            .lt('ExpiresAt', new Date().toISOString())
            .not('ExpiresAt', 'is', null);

        // Get active buffs
        const { data: buffs, error } = await supabase
            .from('UserBuffs')
            .select('*, Items(Name, IconUrl)')
            .eq('UserId', userId)
            .eq('Active', true)
            .or(`ExpiresAt.is.null,ExpiresAt.gt.${new Date().toISOString()}`);

        if (error) throw error;

        const buffsList = buffs.map(buff => ({
            id: buff.Id,
            type: buff.BuffType,
            value: buff.BuffValue,
            isPercentage: buff.IsPercentage,
            appliedAt: buff.AppliedAt,
            expiresAt: buff.ExpiresAt,
            itemName: buff.Items?.Name,
            itemIcon: buff.Items?.IconUrl,
            remainingSeconds: buff.ExpiresAt
                ? Math.max(0, Math.floor((new Date(buff.ExpiresAt) - new Date()) / 1000))
                : null
        }));

        res.json({ buffs: buffsList });

    } catch (err) {
        console.error('Get buffs error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's total calculated stats
app.get('/api/users/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('Rank, Exp')
            .eq('Id', userId)
            .single();

        if (userError) throw userError;

        // Base stats from rank
        const baseStats = {
            hp: 100 + (user.Rank * 50),
            atk: 10 + (user.Rank * 5),
            def: 5 + (user.Rank * 3),
            spd: 10 + (user.Rank * 2)
        };

        // Get active buffs
        const { data: buffs } = await supabase
            .from('UserBuffs')
            .select('BuffType, BuffValue, IsPercentage')
            .eq('UserId', userId)
            .eq('Active', true)
            .or(`ExpiresAt.is.null,ExpiresAt.gt.${new Date().toISOString()}`);

        // Calculate total stats with buffs
        let totalStats = { ...baseStats };

        if (buffs && buffs.length > 0) {
            buffs.forEach(buff => {
                if (totalStats[buff.BuffType] !== undefined) {
                    if (buff.IsPercentage) {
                        totalStats[buff.BuffType] = Math.floor(
                            totalStats[buff.BuffType] * (1 + buff.BuffValue / 100)
                        );
                    } else {
                        totalStats[buff.BuffType] += buff.BuffValue;
                    }
                }
            });
        }

        res.json({
            baseStats,
            totalStats,
            buffsApplied: buffs?.length || 0
        });

    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// VIP Status Route
app.get('/api/vip/status/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabase
            .from('Users')
            .select('VipStatus, VipExpiresAt')
            .eq('Id', userId)
            .single();

        if (error) throw error;

        res.json({
            vipStatus: data?.VipStatus || 'none',
            vipExpiresAt: data?.VipExpiresAt || null
        });
    } catch (err) {
        console.error('VIP Status Error:', err);
        res.json({ vipStatus: 'none', vipExpiresAt: null });
    }
});

// VIP Purchase Route
app.post('/api/vip/purchase', async (req, res) => {
    const { userId, vipType } = req.body;

    try {
        // Define costs
        const costs = {
            monthly: 200,
            lifetime: 2000
        };

        const cost = costs[vipType];
        if (!cost) {
            return res.status(400).json({ message: 'Invalid VIP type' });
        }

        // Get user's current stones and VIP status
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('Stones, VipStatus')
            .eq('Id', userId)
            .single();

        if (userError) throw userError;

        // Check if user has enough stones
        if (user.Stones < cost) {
            return res.status(400).json({
                success: false,
                message: `Không đủ Đá Linh Thạch! Cần ${cost}, hiện có ${user.Stones}`
            });
        }

        // Calculate expiration date
        let expiresAt = null;
        if (vipType === 'monthly') {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);
            expiresAt = expirationDate.toISOString();
        }
        // lifetime doesn't expire

        // Update user: deduct stones and set VIP status
        const { error: updateError } = await supabase
            .from('Users')
            .update({
                Stones: user.Stones - cost,
                VipStatus: vipType,
                VipExpiresAt: expiresAt
            })
            .eq('Id', userId);

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: `Mua VIP ${vipType === 'monthly' ? 'Tháng' : 'Vĩnh Viễn'} thành công!`,
            vipStatus: vipType,
            expiresAt: expiresAt,
            newBalance: user.Stones - cost
        });

    } catch (err) {
        console.error('VIP Purchase Error:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi mua VIP',
            error: err.message
        });
    }
});

// VIP Daily Claim Route
app.post('/api/vip/daily-claim', async (req, res) => {
    const { userId } = req.body;

    try {
        // Get user's VIP status and last claim
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('VipStatus, VipExpiresAt, VipLastClaim, Stones')
            .eq('Id', userId)
            .single();

        if (userError) throw userError;

        // Check if user has VIP
        if (!user.VipStatus || user.VipStatus === 'none') {
            return res.status(400).json({ message: 'Bạn chưa có VIP!' });
        }

        // Check if VIP expired
        if (user.VipExpiresAt && new Date(user.VipExpiresAt) < new Date()) {
            return res.status(400).json({ message: 'VIP của bạn đã hết hạn!' });
        }

        // Check if already claimed today
        if (user.VipLastClaim) {
            const lastClaim = new Date(user.VipLastClaim);
            const now = new Date();
            const hoursSince = (now - lastClaim) / (1000 * 60 * 60);

            if (hoursSince < 24) {
                const hoursLeft = Math.ceil(24 - hoursSince);
                return res.status(400).json({
                    message: `Bạn đã nhận hôm nay! Quay lại sau ${hoursLeft} giờ.`
                });
            }
        }

        // Calculate claim amount
        const claimAmount = user.VipStatus === 'lifetime' ? 200 : 100;

        // Update user: add stones and set last claim
        const { error: updateError } = await supabase
            .from('Users')
            .update({
                Stones: user.Stones + claimAmount,
                VipLastClaim: new Date().toISOString()
            })
            .eq('Id', userId);

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Nhận đá hàng ngày thành công!',
            amount: claimAmount,
            newBalance: user.Stones + claimAmount
        });

    } catch (err) {
        console.error('VIP Daily Claim Error:', err);
        res.status(500).json({
            message: 'Lỗi server',
            error: err.message
        });
    }
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
