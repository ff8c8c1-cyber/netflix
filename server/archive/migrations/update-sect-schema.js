const fs = require('fs');
const { query } = require('./db');

async function updateSectSchema() {
    try {
        console.log('📜 Reading SQL file...');
        const sql = fs.readFileSync('add_sect_schema.sql', 'utf8');

        // Split by GO or simple batches if needed, but for now just run it
        // Since msnodesqlv8 might not handle multiple batches well in one go if they contain GO, 
        // but our SQL doesn't have GO. It has multiple IF blocks.
        // We can try running it as one block.

        console.log('🚀 Executing Schema Update...');
        await query(sql);

        console.log('✅ Sect Schema Updated Successfully!');
    } catch (err) {
        console.error('❌ Error updating schema:', err);
    }
}

updateSectSchema();
