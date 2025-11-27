const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

console.log('Upload routes loaded');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads/videos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Use timestamp + original name to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // Limit 5GB
    fileFilter: (req, file, cb) => {
        // Allow more video formats
        const filetypes = /mp4|mkv|avi|mov|webm|m4v|wmv|flv|ts|3gp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        // Some browsers/OS might not send correct mimetype for MKV/TS, so we trust extension more if mimetype fails
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Error: Only video files are allowed!'));
    }
});

// Upload Endpoint
router.post('/video', (req, res, next) => {
    upload.single('video')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error('Multer Error:', err);
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error('Unknown Upload Error:', err);
            return res.status(400).json({ message: err.message });
        }
        // Everything went fine.
        next();
    });
}, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the URL to access the file
        const fileUrl = `http://localhost:3000/uploads/videos/${req.file.filename}`;
        console.log('File uploaded:', fileUrl);
        res.json({
            success: true,
            message: 'File uploaded successfully',
            url: fileUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error processing upload' });
    }
});

module.exports = router;
