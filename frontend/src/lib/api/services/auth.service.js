import { USE_MOCK, http, delay } from "@/lib/api/client";
import { db } from "@/lib/api/mock/store";

function safeUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

export const authService = {
  async register(payload) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      if (data.users.some((u) => u.email === payload.email)) {
        throw new Error("Email already registered");
      }
      const user = {
        id: db.uid("u"),
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        role: payload.role || "BUYER",
        kycStatus: payload.role === "BUYER" ? "NOT_SUBMITTED" : "VERIFIED",
        createdAt: new Date().toISOString(),
      };
      data.users.push(user);
      db.write(data);
      return {
        success: true,
        data: { user: safeUser(user), token: `mock_${user.id}` },
      };
    }
    const res = await http.post("/auth/register", payload);
    return res.data;
  },

  async login(email, password) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const user = data.users.find(
        (u) => u.email === email && u.password === password
      );
      if (!user) throw new Error("Invalid email or password");
      return {
        success: true,
        data: { user: safeUser(user), token: `mock_${user.id}` },
      };
    }
    const res = await http.post("/auth/login", { email, password });
    return res.data;
  },

  async me() {
    if (USE_MOCK) {
      await delay(150);
      const raw = localStorage.getItem("krishi-auth");
      const token = raw ? JSON.parse(raw)?.state?.token : null;
      if (!token) throw new Error("Not authenticated");
      const userId = token.replace("mock_", "");
      const data = db.read();
      const user = data.users.find((u) => u.id === userId);
      if (!user) throw new Error("Invalid token");
      return { success: true, data: safeUser(user) };
    }
    const res = await http.get("/auth/me");
    return res.data;
  },
};
