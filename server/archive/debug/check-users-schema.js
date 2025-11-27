const { query } = require('./db');

const checkSchema = async () => {
    try {
        console.log('🔍 Checking Users table schema...');
        const result = await query(`
            SELECT TABLE_NAME, COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('Users', 'UserItems', 'Items')
            ORDER BY TABLE_NAME
        `);
        console.log('Columns:', result.recordset);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

checkSchema();
