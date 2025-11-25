
const http = require('http');

const data = JSON.stringify({
    petId: 2,
    newTier: 6,
    newVisualUrl: 'http://test-url.com'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/pets/breakthrough',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
