import { USE_MOCK, http, delay } from "@/lib/api/client";
import { db } from "@/lib/api/mock/store";

export const adminService = {
  async getSettings() {
    if (USE_MOCK) {
      await delay(150);
      return { success: true, data: db.read().settings };
    }
    const res = await http.get("/admin/settings");
    return res.data;
  },

  async updateBiddingDuration(hours) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      data.settings.defaultBiddingDurationHours = Number(hours);
      data.settings.updatedAt = new Date().toISOString();
      db.write(data);
      return { success: true, data: data.settings };
    }
    const res = await http.patch("/admin/bidding-duration", { hours });
    return res.data;
  },

  async stats() {
    if (USE_MOCK) {
      await delay(150);
      const d = db.read();
      return {
        success: true,
        data: {
          users: d.users.length,
          farmers: d.users.filter((u) => u.role === "FARMER").length,
          buyers: d.users.filter((u) => u.role === "BUYER").length,
          crops: d.crops.filter((c) => c.status !== "DELETED").length,
          openCrops: d.crops.filter((c) => c.status === "OPEN").length,
          soldCrops: d.crops.filter((c) => c.status === "SOLD").length,
          bids: d.bids.length,
          pendingKyc: d.users.filter((u) => u.kycStatus === "PENDING").length,
        },
      };
    }
    const res = await http.get("/admin/stats");
    return res.data;
  },
};
