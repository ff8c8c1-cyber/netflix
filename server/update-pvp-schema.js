const { execute, query } = require('./db');
const fs = require('fs');
const path = require('path');

async function updatePvPSchema() {
    try {
        console.log('Applying PvP Schema...');
        const sqlPath = path.join(__dirname, '../add_pvp_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by GO for SQL Server batch execution
        const batches = sql.split('GO');

        for (const batch of batches) {
            if (batch.trim()) {
                await query(batch);
            }
        }

        console.log('PvP Schema applied successfully!');
    } catch (err) {
        console.error('Error applying PvP Schema:', err);
    }
}

updatePvPSchema();
