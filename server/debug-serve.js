const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Log file existence
const filePath = path.join(__dirname, 'uploads/videos/1763968637838-202742591.mp4');
console.log('Checking file:', filePath);
if (fs.existsSync(filePath)) {
    console.log('File exists. Size:', fs.statSync(filePath).size);
} else {
    console.error('File NOT found!');
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
    console.log(`Debug server running on http://localhost:${PORT}`);
    console.log(`Try accessing: http://localhost:${PORT}/uploads/videos/1763968637838-202742591.mp4`);
});
