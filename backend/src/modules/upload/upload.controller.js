const cloudinary = require('cloudinary').v2;
const config = require('../../config');
const ApiResponse = require('../../utils/apiResponse');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

class UploadController {
  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: { message: 'No file provided' } });
      }

      const folder = req.body.folder || 'krishi-mitra';

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ error: { message: 'Image upload failed: ' + error.message } });
          }
          return res.json({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      );

      uploadStream.end(req.file.buffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UploadController();
