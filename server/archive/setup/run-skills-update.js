const { query } = require('./db');
const fs = require('fs');
const path = require('path');

const runUpdate = async () => {
    try {
        const sqlPath = path.join(__dirname, '..', 'create_sect_skills.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by GO if necessary, but for now simple execution
        // Since msnodesqlv8 might not handle multiple batches well without splitting, 
        // but our script is simple enough or we can split manually if needed.
        // Actually, let's just run it as one block if possible, or split by simple regex if we had GO.
        // Our SQL doesn't use GO, so it should be fine as one batch or multiple statements.

        await query(sql);
        console.log('Sect Skills schema updated successfully!');
    } catch (err) {
        console.error('Error updating schema:', err);
    }
};

runUpdate();
