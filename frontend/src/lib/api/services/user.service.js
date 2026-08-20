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

export const userService = {
  async updateProfile(patch) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const uid = getCurrentUserId();
      const idx = data.users.findIndex((u) => u.id === uid);
      if (idx === -1) throw new Error("User not found");
      data.users[idx] = { ...data.users[idx], ...patch };
      db.write(data);
      const { password, ...safe } = data.users[idx];
      return { success: true, data: safe };
    }
    const res = await http.put("/users/profile", patch);
    return res.data;
  },

  async submitKyc(payload) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const uid = getCurrentUserId();
      const idx = data.users.findIndex((u) => u.id === uid);
      if (idx === -1) throw new Error("User not found");
      data.users[idx].kyc = payload;
      data.users[idx].kycStatus = "PENDING";
      db.write(data);
      const { password, ...safe } = data.users[idx];
      return { success: true, data: safe };
    }
    const res = await http.post("/users/kyc", payload);
    return res.data;
  },

  async listUsers({ role, page = 1, limit = 20 } = {}) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      let users = data.users;
      if (role) users = users.filter((u) => u.role === role);
      const total = users.length;
      const start = (page - 1) * limit;
      const items = users
        .slice(start, start + limit)
        .map(({ password, ...rest }) => rest);
      return { success: true, data: { items, total, page, limit } };
    }
    const params = new URLSearchParams();
    if (role) params.append("role", role);
    params.append("page", page);
    params.append("limit", limit);
    const res = await http.get(`/users?${params.toString()}`);
    return res.data;
  },

  async setKycStatus(userId, status) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const idx = data.users.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error("User not found");
      data.users[idx].kycStatus = status;
      db.write(data);
      const { password, ...safe } = data.users[idx];
      return { success: true, data: safe };
    }
    const res = await http.patch(`/users/${userId}/kyc-status`, { status });
    return res.data;
  },

  async getById(userId) {
    if (USE_MOCK) {
      await delay(80);
      const data = db.read();
      const u = data.users.find((x) => x.id === userId);
      if (!u) return { success: false, data: null };
      const { password, ...safe } = u;
      return { success: true, data: safe };
    }
    const res = await http.get(`/users/${userId}`);
    return res.data;
  },
};
