const aiService = require('./ai.service');
const ApiResponse = require('../../utils/apiResponse');

class AIController {
  /**
   * POST /api/ai/chat
   * Body: { message, language, imageBase64?, imageMimeType? }
   * OR multipart with image file
   */
  async chat(req, res, next) {
    try {
      const { message, language } = req.body;
      let imageBase64 = req.body.imageBase64;
      let imageMimeType = req.body.imageMimeType;

      // If file uploaded via multer
      if (req.file) {
        imageBase64 = req.file.buffer.toString('base64');
        imageMimeType = req.file.mimetype;
      }

      const result = await aiService.chat({
        message,
        imageBase64,
        imageMimeType,
        language: language || 'Hindi',
      });

      return ApiResponse.success(res, result, 'AI response generated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/analyze-crop
   * Body: { cropName, language, imageBase64?, imageMimeType? }
   */
  async analyzeCrop(req, res, next) {
    try {
      const { cropName, language } = req.body;
      let imageBase64 = req.body.imageBase64;
      let imageMimeType = req.body.imageMimeType;

      if (req.file) {
        imageBase64 = req.file.buffer.toString('base64');
        imageMimeType = req.file.mimetype;
      }

      const result = await aiService.analyzeCropImage({
        imageBase64,
        imageMimeType,
        cropName,
        language: language || 'Hindi',
      });

      return ApiResponse.success(res, result, 'Crop analysis complete');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AIController();
