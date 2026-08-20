const express = require('express');
const uploadController = require('./upload.controller');
const multer = require('multer');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', authenticate, upload.single('file'), uploadController.uploadImage);

module.exports = router;
