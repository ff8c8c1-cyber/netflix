const fs = require('fs');
const { query } = require('./db');

async function runUpdate() {
    try {
        console.log('📜 Reading SQL file...');
        const sql = fs.readFileSync('update_sect_real_data.sql', 'utf8');

        // Split by GO is not needed as we don't use GO in the file (using IF blocks)
        // But if msnodesqlv8 has issues with multiple statements, we might need to be careful.
        // The previous update worked fine, so we'll try running it as a block.

        console.log('🚀 Executing Real Data Update...');
        await query(sql);

        console.log('✅ Real Data Updated Successfully!');
    } catch (err) {
        console.error('❌ Error updating data:', err);
    }
}

runUpdate();
