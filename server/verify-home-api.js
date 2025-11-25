// const fetch = require('node-fetch'); // Built-in in Node 22

const API_URL = 'http://localhost:3000/api';

async function verifyEndpoints() {
    try {
        console.log('Testing /api/movies/trending...');
        const trending = await fetch(`${API_URL}/movies/trending`).then(res => res.json());
        console.log('✅ Trending:', trending.length > 0 ? 'OK' : 'Empty');

        console.log('Testing /api/movies/new...');
        const newReleases = await fetch(`${API_URL}/movies/new`).then(res => res.json());
        console.log('✅ New Releases:', newReleases.length > 0 ? 'OK' : 'Empty');

        console.log('Testing /api/movies/top-rated...');
        const topRated = await fetch(`${API_URL}/movies/top-rated`).then(res => res.json());
        console.log('✅ Top Rated:', topRated.length > 0 ? 'OK' : 'Empty');

        console.log('Testing /api/movies/categories...');
        const categories = await fetch(`${API_URL}/movies/categories`).then(res => res.json());
        console.log('✅ Categories:', categories.length > 0 ? 'OK' : 'Empty');
        console.log('   Categories found:', categories.map(c => c.title).join(', '));

        // Test user stats (assuming user 1 exists, if not it might return null or empty)
        console.log('Testing /api/users/1/home-stats...');
        const userStats = await fetch(`${API_URL}/users/1/home-stats`).then(res => res.json());
        console.log('✅ User Stats:', userStats ? 'OK' : 'Failed');
        console.log('   Stats:', userStats);

    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

verifyEndpoints();
