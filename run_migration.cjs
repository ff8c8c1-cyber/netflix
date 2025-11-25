const fs = require('fs');
const path = require('path');
const { query } = require('./server/db');

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, 'add_pet_system.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Split by GO to execute batches
        const batches = sqlContent.split('GO');

        for (const batch of batches) {
            if (batch.trim()) {
                console.log('Executing batch...');
                await query(batch);
                console.log('Batch executed successfully.');
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
