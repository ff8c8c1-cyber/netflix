const { query } = require('./db');

async function resetUserPet() {
    try {
        console.log('Resetting user pets...');
        // For dev environment, we'll just truncate the Pets table or delete all.
        // In a real app, we'd target a specific userId.

        await query('DELETE FROM Pets');

        console.log('All pets have been released! You can now hatch a new one.');
    } catch (err) {
        console.error('Error resetting pets:', err);
    }
}

resetUserPet();
