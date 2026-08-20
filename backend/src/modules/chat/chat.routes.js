const express = require('express');
const chatController = require('./chat.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

router.get('/unread', authenticate, chatController.getUnreadCount);
router.post('/', authenticate, chatController.createOrGetChat);
router.get('/', authenticate, chatController.getUserChats);
router.post('/:id/messages', authenticate, chatController.sendMessage);
router.get('/:id/messages', authenticate, chatController.getChatMessages);

module.exports = router;
