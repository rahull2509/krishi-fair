const prisma = require('../../config/database');

class ChatService {
  /**
   * Create or get existing chat between two users
   */
  async createOrGetChat(userId, otherUserId) {
    if (userId === otherUserId) {
      throw Object.assign(new Error('Cannot chat with yourself'), { statusCode: 400 });
    }

    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { member1Id: userId, member2Id: otherUserId },
          { member1Id: otherUserId, member2Id: userId },
        ],
      },
      include: {
        member1: { select: { id: true, name: true, role: true, avatar: true } },
        member2: { select: { id: true, name: true, role: true, avatar: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (existingChat) return existingChat;

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        member1Id: userId,
        member2Id: otherUserId,
      },
      include: {
        member1: { select: { id: true, name: true, role: true, avatar: true } },
        member2: { select: { id: true, name: true, role: true, avatar: true } },
      },
    });

    return chat;
  }

  /**
   * Get all chats for a user
   */
  async getUserChats(userId) {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { member1Id: userId },
          { member2Id: userId },
        ],
      },
      include: {
        member1: { select: { id: true, name: true, role: true, avatar: true } },
        member2: { select: { id: true, name: true, role: true, avatar: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return chats;
  }

  /**
   * Get unread messages count for a user
   */
  async getUnreadCount(userId) {
    const count = await prisma.message.count({
      where: {
        isRead: false,
        senderId: { not: userId },
        chat: {
          OR: [
            { member1Id: userId },
            { member2Id: userId },
          ],
        },
      },
    });
    return { count };
  }

  /**
   * Send a message in a chat
   */
  async sendMessage(chatId, senderId, { content, imageId }) {
    // Verify user is part of this chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw Object.assign(new Error('Chat not found'), { statusCode: 404 });
    }
    if (chat.member1Id !== senderId && chat.member2Id !== senderId) {
      throw Object.assign(new Error('You are not part of this chat'), { statusCode: 403 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        imageId,
        chatId,
        senderId,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    // Update chat timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  /**
   * Get messages for a chat
   */
  async getChatMessages(chatId, userId, { page = 1, limit = 50 }) {
    // Verify user is part of this chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw Object.assign(new Error('Chat not found'), { statusCode: 404 });
    }
    if (chat.member1Id !== userId && chat.member2Id !== userId) {
      throw Object.assign(new Error('You are not part of this chat'), { statusCode: 403 });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { chatId },
        skip,
        take: parseInt(limit),
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.message.count({ where: { chatId } }),
    ]);

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return { messages: messages.reverse(), total };
  }
}

module.exports = new ChatService();
