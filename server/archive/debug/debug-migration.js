const { query } = require('./db');
const { supabase } = require('./supabase');

async function migrateUsers() {
    console.log('📦 Migrating Users...');
    try {
        const sqlData = await query(`SELECT * FROM Users`);
        const rows = sqlData.recordset;
        console.log(`   Found ${rows.length} users.`);

        const { error } = await supabase.from('Users').insert(rows);

        if (error) {
            console.error(`   ❌ Error:`, error.message);
            console.error(`   Details:`, error.details);
            console.error(`   Hint:`, error.hint);
        } else {
            console.log(`   ✅ Success!`);
        }
    } catch (err) {
        console.error(`   ❌ Failed:`, err.message);
    }
    process.exit();
}

migrateUsers();
