
const { execute } = require('./db');

async function run() {
    try {
        console.log('Testing sp_Breakthrough directly...');
        const result = await execute('sp_Breakthrough', {
            PetId: 2,
            NewTier: 6,
            NewVisualUrl: 'test',
            NewStats: JSON.stringify({ atk: 12, def: 12, hp: 120, spd: 12, cri: 10 })
        });
        console.log('Success:', result.recordset);
    } catch (err) {
        console.error('Error executing SP:', err);
    }
}

run();
