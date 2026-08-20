const express = require('express');
const multer = require('multer');
const aiController = require('./ai.controller');

const router = express.Router();

// Multer config for image upload (memory storage for base64 conversion)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
    }
  },
});

// AI Chat (text + optional image). Public so the site-wide assistant works before login.
router.post('/chat', upload.single('image'), aiController.chat);

// Crop disease analysis
router.post('/analyze-crop', upload.single('image'), aiController.analyzeCrop);

module.exports = router;
