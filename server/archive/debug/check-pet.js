const { query } = require('./db');

async function checkPet() {
    try {
        console.log('Checking for TestPetManualV2...');
        const result = await query("SELECT * FROM Pets WHERE Name = 'TestPetManualV2'");
        console.table(result.recordset);
    } catch (err) {
        console.error('Error checking pet:', err);
    }
}

checkPet();
