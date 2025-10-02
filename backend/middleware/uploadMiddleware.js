const multer = require("multer");
const fs = require('fs');
const path = require('path');

// Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        try {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        } catch (err) {
            console.error('Error creating upload directory:', err);
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File Filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.'), false);
    }
}

// Configure Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    }
});

// Error handling middleware for file uploads
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({
            success: false,
            message: err.code === 'LIMIT_FILE_SIZE' 
                ? 'File too large. Maximum size is 5MB.' 
                : 'Error uploading file.'
        });
    } else if (err) {
        // An unknown error occurred
        return res.status(400).json({
            success: false,
            message: err.message || 'Error processing file upload.'
        });
    }
    next();
};

module.exports = { upload, handleUploadErrors };