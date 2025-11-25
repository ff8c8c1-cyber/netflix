const { execute, query } = require('./db');
const bcrypt = require('bcryptjs');

const BOTS = [
    { name: 'Daoist_Wan', pet: 'Dragon', element: 'Thunder' },
    { name: 'Fairy_Ling', pet: 'Phoenix', element: 'Fire' },
    { name: 'Monk_Hui', pet: 'Tiger', element: 'Ice' },
    { name: 'Demon_Xue', pet: 'Fox', element: 'Mind' },
    { name: 'Sword_Chen', pet: 'Dragon', element: 'Thunder' },
    { name: 'Elder_Mo', pet: 'Tiger', element: 'Ice' },
    { name: 'Saintess_Yu', pet: 'Phoenix', element: 'Fire' },
    { name: 'Rogue_Han', pet: 'Fox', element: 'Mind' },
    { name: 'Master_Feng', pet: 'Dragon', element: 'Thunder' },
    { name: 'Disciple_Li', pet: 'Tiger', element: 'Ice' }
];

const SKILLS_DB = {
    'Dragon': [
        { name: "Lôi Nha", desc: "Cắn gây sát thương lôi.", type: "Active", power: 60 },
        { name: "Lôi Vũ", desc: "Bắn lông vũ sét.", type: "Active", power: 50 },
        { name: "Thiên Lôi Liên Kích", desc: "Sét đánh liên hoàn.", type: "Active", power: 80 },
        { name: "Cửu Thiên Lôi Long", desc: "Triệu hồi rồng sét tối thượng.", type: "Ultimate", power: 120 }
    ],
    'Phoenix': [
        { name: "Hỏa Linh Châm", desc: "Kim châm lửa.", type: "Active", power: 50 },
        { name: "Liệt Diễm Vũ", desc: "Vũ điệu lửa.", type: "Active", power: 70 },
        { name: "Diễm Vũ Lưu Tinh", desc: "Mưa thiên thạch.", type: "Active", power: 90 },
        { name: "Thiên Hỏa Niết Bàn", desc: "Bùng nổ sức mạnh phượng hoàng.", type: "Ultimate", power: 110 }
    ],
    'Tiger': [
        { name: "Băng Trảo", desc: "Vuốt băng giá.", type: "Active", power: 60 },
        { name: "Hàn Nha Cắn Xé", desc: "Cắn xé đóng băng.", type: "Active", power: 70 },
        { name: "Bạo Tuyết Liên Trảm", desc: "Combo bão tuyết.", type: "Active", power: 85 },
        { name: "Thiên Hàn Hổ Khiếu", desc: "Tiếng gầm chấn động.", type: "Ultimate", power: 115 }
    ],
    'Fox': [
        { name: "Hồ Hỏa", desc: "Lửa hồ ly.", type: "Active", power: 55 },
        { name: "Mê Hoặc", desc: "Gây choáng nhẹ.", type: "Active", power: 40 },
        { name: "Cửu Vĩ Tiên Thuật", desc: "Phép thuật cửu vĩ.", type: "Ultimate", power: 100 }
    ]
};

async function seedPvPBots() {
    try {
        console.log('🌱 Seeding PvP Bots...');

        for (const bot of BOTS) {
            // 1. Create User
            const passwordHash = await bcrypt.hash('123456', 10);
            const userRes = await query(`
                IF NOT EXISTS (SELECT * FROM Users WHERE Username = '${bot.name}')
                BEGIN
                    INSERT INTO Users (Username, PasswordHash, Email, CreatedAt)
                    OUTPUT INSERTED.Id
                    VALUES ('${bot.name}', '${passwordHash}', '${bot.name.toLowerCase()}@sect.com', GETDATE())
                END
                ELSE
                BEGIN
                    SELECT Id FROM Users WHERE Username = '${bot.name}'
                END
            `);
            const userId = userRes.recordset[0].Id;

            // 2. Create Pet
            const tier = Math.floor(Math.random() * 5); // 0-4
            const level = tier * 10 + Math.floor(Math.random() * 10) + 1;
            const elo = 800 + Math.floor(Math.random() * 400); // 800 - 1200

            // Stats based on Tier
            const multiplier = 1 + (tier * 0.5);
            const stats = {
                hp: Math.floor(100 * multiplier),
                atk: Math.floor(20 * multiplier),
                def: Math.floor(10 * multiplier),
                spd: Math.floor(10 * multiplier),
                cri: Math.floor(5 + tier * 2)
            };

            // Skills based on Tier
            const availableSkills = SKILLS_DB[bot.pet] || [];
            const skills = availableSkills.slice(0, tier + 1); // Unlock skills based on tier

            // Visual URL (Placeholder or Pollinations)
            const visualUrl = `https://image.pollinations.ai/prompt/mystical ${bot.element} ${bot.pet} tier ${tier} fantasy art?width=400&height=400&nologo=true`;

            // Insert Pet
            await query(`
                INSERT INTO Pets (UserId, Name, Species, Element, Tier, Level, Exp, Bond, Mood, Stats, Skills, VisualUrl, Elo, Wins, Losses, Rarity)
                VALUES (
                    ${userId}, 
                    N'${bot.pet} ${bot.name}', 
                    '${bot.pet}', 
                    '${bot.element}', 
                    ${tier}, 
                    ${level}, 
                    0, 
                    100, 
                    'Happy', 
                    '${JSON.stringify(stats)}', 
                    N'${JSON.stringify(skills)}', 
                    '${visualUrl}', 
                    ${elo}, 
                    ${Math.floor(Math.random() * 10)}, 
                    ${Math.floor(Math.random() * 10)},
                    'Divine'
                )
            `);

            console.log(`✅ Created Bot: ${bot.name} with ${bot.pet} (Tier ${tier}, Elo ${elo})`);
        }

        console.log('🎉 PvP Bots Seeded Successfully!');
    } catch (err) {
        console.error('❌ Error seeding bots:', err);
    }
}

seedPvPBots();
