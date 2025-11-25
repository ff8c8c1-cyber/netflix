const { execute } = require('./db');

async function debugWatchHistory() {
    console.log('--- Debugging sp_UpdateWatchHistory ---');

    // Test Case 1: Valid Data (Assuming User 1 and Movie 1 exist)
    try {
        console.log('Test 1: Valid Data (Movie 1, User 1, Episode null)');
        await execute('sp_UpdateWatchHistory', {
            UserId: 1,
            MovieId: 1,
            EpisodeId: null,
            ProgressSeconds: 120
        });
        console.log('✅ Test 1 Passed');
    } catch (err) {
        console.error('❌ Test 1 Failed:', err.message);
    }

    // Test Case 2: Valid Data with Episode (Assuming Episode 1 exists)
    try {
        console.log('Test 2: Valid Data with Episode (Movie 1, User 1, Episode 1)');
        await execute('sp_UpdateWatchHistory', {
            UserId: 1,
            MovieId: 1,
            EpisodeId: 1,
            ProgressSeconds: 300
        });
        console.log('✅ Test 2 Passed');
    } catch (err) {
        console.error('❌ Test 2 Failed:', err.message);
    }

    // Test Case 3: Missing EpisodeId (undefined) - This simulates what might happen if frontend sends undefined
    try {
        console.log('Test 3: Undefined EpisodeId');
        await execute('sp_UpdateWatchHistory', {
            UserId: 1,
            MovieId: 1,
            EpisodeId: undefined,
            ProgressSeconds: 60
        });
        console.log('✅ Test 3 Passed');
    } catch (err) {
        console.error('❌ Test 3 Failed:', err.message);
    }

    process.exit();
}

debugWatchHistory();
