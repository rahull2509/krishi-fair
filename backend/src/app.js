const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Import route modules
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const cropRoutes = require('./modules/crop/crop.routes');
const biddingRoutes = require('./modules/bidding/bidding.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const marketRoutes = require('./modules/market/market.routes');
const agroRoutes = require('./modules/agro/agro.routes');
const uploadRoutes = require('./modules/upload/upload.routes');

// Import cron jobs
const { startBiddingCron } = require('./utils/cronJobs');

const app = express();

// ==================== MIDDLEWARE ====================

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads (if any)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🌾 Krishi Fare Marketplace API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    modules: [
      'Auth & RBAC',
      'User & KYC',
      'Crop Listings',
      'Bidding System',
      'Chat',
      'AI Chatbot (Multilingual)',
      'Market Prices (AGMARKNET)',
      'Agro Monitoring',
    ],
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api', biddingRoutes);       // Handles /api/crops/:id/bids, /api/bids/*, /api/admin/*
app.use('/api/chats', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/agro', agroRoutes);
app.use('/api/upload', uploadRoutes);

// ==================== 404 Handler ====================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

// ==================== START SERVER ====================
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`\n🌾 ========================================`);
  console.log(`   Krishi Fare Marketplace API`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`🌾 ========================================\n`);

  // Start cron jobs
  startBiddingCron();
});

module.exports = app;
