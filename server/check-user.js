const { query } = require('./db');

async function checkUser() {
    try {
        console.log('Checking User 1...');
        const result = await query('SELECT * FROM Users WHERE Id = 1');
        console.table(result.recordset);

        console.log('Checking all users count...');
        const count = await query('SELECT COUNT(*) as Count FROM Users');
        console.log('Total Users:', count.recordset[0].Count);
    } catch (err) {
        console.error('Error checking user:', err);
    }
}

checkUser();
