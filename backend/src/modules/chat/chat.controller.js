const chatService = require('./chat.service');
const ApiResponse = require('../../utils/apiResponse');

class ChatController {
  /** POST /api/chats */
  async createOrGetChat(req, res, next) {
    try {
      const chat = await chatService.createOrGetChat(req.user.id, req.body.otherUserId);
      return ApiResponse.success(res, chat);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/chats */
  async getUserChats(req, res, next) {
    try {
      const chats = await chatService.getUserChats(req.user.id);
      return ApiResponse.success(res, chats);
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/chats/unread */
  async getUnreadCount(req, res, next) {
    try {
      const data = await chatService.getUnreadCount(req.user.id);
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/chats/:id/messages */
  async sendMessage(req, res, next) {
    try {
      const message = await chatService.sendMessage(req.params.id, req.user.id, req.body);
      return ApiResponse.created(res, message, 'Message sent');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/chats/:id/messages */
  async getChatMessages(req, res, next) {
    try {
      const { messages, total } = await chatService.getChatMessages(
        req.params.id, req.user.id, req.query
      );
      return ApiResponse.paginated(res, messages, total, req.query.page || 1, req.query.limit || 50);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
