const { query } = require('./db');
const { supabase } = require('./supabase');

const TABLES = [
    'Users',
    'Movies',
    'Items',
    'Sects',
    'SectSkills',
    'Episodes',
    'Reviews',
    'Comments',
    'WatchHistory',
    'Favorites',
    'Notifications',
    'UserItems',
    'Transactions',
    'SectMembers',
    'SectBuildings',
    'Pets',
    'UserSectSkills'
];

async function migrateData() {
    console.log('🚀 Starting Data Migration...');

    for (const table of TABLES) {
        console.log(`\n📦 Migrating ${table}...`);
        try {
            // 1. Get data from SQL Server
            const result = await query(`SELECT * FROM "${table}"`); // Use quotes for safety, though SQL Server usually fine without if no spaces
            // Actually SQL Server uses [] or "" for identifiers. Let's try simple select first.
            // Wait, my db.js query function uses simple string.
            // Let's use `SELECT * FROM ${table}`

            const sqlData = await query(`SELECT * FROM ${table}`);
            const rows = sqlData.recordset;

            if (rows.length === 0) {
                console.log(`   ⚠️ No data in ${table}. Skipping.`);
                continue;
            }

            console.log(`   Found ${rows.length} rows.`);

            // 2. Insert into Supabase
            // We insert in batches of 100 to be safe
            const BATCH_SIZE = 100;
            for (let i = 0; i < rows.length; i += BATCH_SIZE) {
                const batch = rows.slice(i, i + BATCH_SIZE);

                const { error } = await supabase
                    .from(table)
                    .upsert(batch);

                if (error) {
                    console.error(`   ❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
                    // If error is duplicate key, we might want to upsert?
                    // Let's try upsert if insert fails? Or just ignore?
                    // For migration, we usually want to stop or log.
                } else {
                    console.log(`   ✅ Inserted rows ${i + 1} to ${Math.min(i + BATCH_SIZE, rows.length)}`);
                }
            }

        } catch (err) {
            console.error(`   ❌ Failed to migrate ${table}:`, err.message);
        }
    }

    console.log('\n🎉 Migration Complete!');
    process.exit();
}

migrateData();
