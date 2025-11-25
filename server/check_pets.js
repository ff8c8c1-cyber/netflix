const { execute, query } = require('./db');

async function checkPets() {
    try {
        console.log('Checking Pets table...');
        const result = await query('SELECT Id, UserId, Name, Species FROM Pets');
        console.table(result.recordset);
    } catch (err) {
        console.error(err);
    }
}

checkPets();
