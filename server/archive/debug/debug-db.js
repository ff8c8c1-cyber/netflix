const { query } = require('./db');

async function checkSchema() {
    try {
        console.log('Checking Pets table columns...');
        const result = await query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Pets'
        `);
        console.table(result.recordset);
    } catch (err) {
        console.error('Error checking schema:', err);
    }
}

checkSchema();
