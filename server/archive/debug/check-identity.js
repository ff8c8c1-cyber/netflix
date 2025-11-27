const { query } = require('./db');

async function checkIdentity() {
    try {
        console.log('Checking Identity column...');
        const result = await query(`
            SELECT is_identity 
            FROM sys.columns 
            WHERE object_id = object_id('Pets') AND name = 'Id'
        `);
        console.table(result.recordset);
    } catch (err) {
        console.error('Error checking identity:', err);
    }
}

checkIdentity();
