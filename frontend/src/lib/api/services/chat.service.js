import { USE_MOCK, http, delay } from "@/lib/api/client";
import { db } from "@/lib/api/mock/store";

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem("krishi-auth");
    return JSON.parse(raw)?.state?.user?.id || null;
  } catch {
    return null;
  }
}

function normalizeMessage(message) {
  if (!message) return message;
  return {
    ...message,
    senderId: message.senderId || message.sender?.id,
  };
}

function normalizeChat(chat) {
  if (!chat) return chat;
  const uid = getCurrentUserId();
  const other =
    chat.other ||
    (chat.member1Id === uid ? chat.member2 : chat.member1) ||
    (chat.member1?.id === uid ? chat.member2 : chat.member1) ||
    null;
  const lastMessage = Array.isArray(chat.messages) ? chat.messages[0] : null;

  return {
    ...chat,
    other,
    lastMessage: chat.lastMessage || lastMessage?.content || "",
    lastMessageAt: chat.lastMessageAt || lastMessage?.createdAt || chat.updatedAt || chat.createdAt,
  };
}

function normalizeChatListResponse(payload) {
  const raw = payload?.data?.items || payload?.data || [];
  return {
    ...payload,
    data: Array.isArray(raw) ? raw.map(normalizeChat) : [],
  };
}

function normalizeMessagesResponse(payload) {
  const raw = payload?.data?.items || payload?.data || [];
  return {
    ...payload,
    data: Array.isArray(raw) ? raw.map(normalizeMessage) : [],
    pagination: payload?.pagination,
  };
}

export const chatService = {
  async getOrCreate(otherUserId) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const uid = getCurrentUserId();
      if (!uid) throw new Error("Not authenticated");
      let chat = data.chats.find(
        (c) =>
          c.participants.includes(uid) &&
          c.participants.includes(otherUserId)
      );
      if (!chat) {
        chat = {
          id: db.uid("ch"),
          participants: [uid, otherUserId],
          lastMessage: "",
          lastMessageAt: new Date().toISOString(),
        };
        data.chats.unshift(chat);
        data.messages[chat.id] = [];
        db.write(data);
      }
      return { success: true, data: chat };
    }
    const res = await http.post("/chats", { otherUserId });
    return { ...res.data, data: normalizeChat(res.data?.data) };
  },

  async myChats() {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const uid = getCurrentUserId();
      const items = data.chats
        .filter((c) => c.participants.includes(uid))
        .map((c) => {
          const otherId = c.participants.find((p) => p !== uid);
          const other = data.users.find((u) => u.id === otherId);
          return {
            ...c,
            other: other
              ? { id: other.id, name: other.name, role: other.role }
              : null,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
        );
      return { success: true, data: items };
    }
    const res = await http.get("/chats");
    return normalizeChatListResponse(res.data);
  },

  async sendMessage(chatId, content) {
    if (USE_MOCK) {
      await delay(150);
      const data = db.read();
      const uid = getCurrentUserId();
      const msg = {
        id: db.uid("m"),
        chatId,
        senderId: uid,
        content,
        createdAt: new Date().toISOString(),
      };
      data.messages[chatId] = data.messages[chatId] || [];
      data.messages[chatId].push(msg);
      const cidx = data.chats.findIndex((c) => c.id === chatId);
      if (cidx !== -1) {
        data.chats[cidx].lastMessage = content;
        data.chats[cidx].lastMessageAt = msg.createdAt;
      }
      db.write(data);
      return { success: true, data: msg };
    }
    const res = await http.post(`/chats/${chatId}/messages`, { content });
    return { ...res.data, data: normalizeMessage(res.data?.data) };
  },

  async getMessages(chatId) {
    if (USE_MOCK) {
      await delay(100);
      const data = db.read();
      return { success: true, data: data.messages[chatId] || [] };
    }
    const res = await http.get(`/chats/${chatId}/messages`);
    return normalizeMessagesResponse(res.data);
  },

  async getUnreadCount() {
    if (USE_MOCK) {
      await delay(50);
      return { success: true, data: { count: 0 } };
    }
    const res = await http.get("/chats/unread");
    return res.data;
  },
};
