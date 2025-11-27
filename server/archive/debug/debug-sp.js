const { query } = require('./db');

async function checkDebug() {
    try {
        console.log('--- Pets Table Schema ---');
        const schema = await query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Pets'
        `);
        console.table(schema.recordset);

        console.log('\n--- sp_HatchPet Definition ---');
        const sp = await query(`sp_helptext 'sp_HatchPet'`);
        sp.recordset.forEach(row => process.stdout.write(row.Text));

    } catch (err) {
        console.error('Error checking debug info:', err);
    }
}

checkDebug();
