const fetch = require('node-fetch');

async function testHatch() {
    try {
        console.log('Testing Hatch API...');
        const response = await fetch('http://localhost:3000/api/pets/hatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 1, // Assuming user 1 exists
                name: 'TestPet',
                species: 'Phoenix',
                element: 'Fire'
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Success:', data);
        } else {
            console.log('Error Status:', response.status);
            const text = await response.text();
            console.log('Error Body:', text);
        }
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

testHatch();
