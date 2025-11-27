
const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch in Node 18+

async function run() {
    try {
        const response = await fetch('http://localhost:3000/api/pets/breakthrough', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                petId: 2,
                newTier: 6,
                newVisualUrl: 'http://test-url.com'
            })
        });

        const data = await response.json();
        console.log('Breakthrough Result:', data);
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
