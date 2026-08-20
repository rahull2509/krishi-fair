const path = require('path');
const dotenv = require('dotenv');

// Load the backend .env even when the server is started from the repo root.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  govApi: {
    apiKey: process.env.GOV_API_KEY,
    resourceId: process.env.GOV_RESOURCE_ID,
    baseUrl: process.env.GOV_API_BASE_URL || 'https://api.data.gov.in',
  },
  agroApi: {
    apiKey: process.env.AGRO_API_KEY,
    baseUrl: process.env.AGRO_API_BASE_URL || 'https://api.agromonitoring.com/agro/1.0',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@krishifare.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
  },
  bidding: {
    defaultDuration: parseInt(process.env.DEFAULT_BIDDING_DURATION) || 24,
  },
  market: {
    cacheEnabled: String(process.env.MARKET_CACHE_ENABLED || 'false').toLowerCase() === 'true',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
