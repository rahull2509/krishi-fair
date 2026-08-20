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

export const bidService = {
  async place(cropId, { amount, message }) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const buyerId = getCurrentUserId();
      const buyer = data.users.find((u) => u.id === buyerId);
      if (!buyer) throw new Error("Not authenticated");
      if (buyer.role !== "BUYER") throw new Error("Only buyers can bid");
      if (buyer.kycStatus !== "VERIFIED")
        throw new Error("Complete KYC verification first");
      const crop = data.crops.find((c) => c.id === cropId);
      if (!crop) throw new Error("Crop not found");
      if (!crop.allowBidding) throw new Error("This crop is direct sale only");
      if (crop.biddingEndsAt && new Date(crop.biddingEndsAt) < new Date())
        throw new Error("Bidding has ended");
      if (Number(amount) < crop.minBidPrice)
        throw new Error(`Bid must be ≥ ₹${crop.minBidPrice}`);
      const bid = {
        id: db.uid("b"),
        cropId,
        buyerId,
        amount: Number(amount),
        message: message || "",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      data.bids.push(bid);
      db.write(data);
      return { success: true, data: bid };
    }
    const res = await http.post(`/crops/${cropId}/bids`, { amount, message });
    return res.data;
  },

  async listForCrop(cropId) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const items = data.bids
        .filter((b) => b.cropId === cropId)
        .map((b) => {
          const buyer = data.users.find((u) => u.id === b.buyerId);
          return {
            ...b,
            buyer: buyer ? { id: buyer.id, name: buyer.name } : null,
          };
        })
        .sort((a, b) => b.amount - a.amount);
      return { success: true, data: items };
    }
    const res = await http.get(`/crops/${cropId}/bids`);
    return res.data;
  },

  async myBids() {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const uid = getCurrentUserId();
      const items = data.bids
        .filter((b) => b.buyerId === uid)
        .map((b) => {
          const crop = data.crops.find((c) => c.id === b.cropId);
          return {
            ...b,
            crop: crop
              ? {
                  id: crop.id,
                  title: crop.title,
                  images: crop.images,
                  basePrice: crop.basePrice,
                  status: crop.status,
                  biddingEndsAt: crop.biddingEndsAt,
                }
              : null,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { success: true, data: items };
    }
    const res = await http.get("/bids/my");
    return res.data;
  },

  async setStatus(bidId, status) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const idx = data.bids.findIndex((b) => b.id === bidId);
      if (idx === -1) throw new Error("Bid not found");
      data.bids[idx].status = status;
      if (status === "ACCEPTED") {
        // mark crop sold and reject other bids
        const cropId = data.bids[idx].cropId;
        const cropIdx = data.crops.findIndex((c) => c.id === cropId);
        if (cropIdx !== -1) data.crops[cropIdx].status = "SOLD";
        data.bids = data.bids.map((b) =>
          b.cropId === cropId && b.id !== bidId && b.status === "PENDING"
            ? { ...b, status: "REJECTED" }
            : b
        );
      }
      db.write(data);
      return { success: true, data: data.bids[idx] };
    }
    const path =
      status === "ACCEPTED" ? `/bids/${bidId}/accept` : `/bids/${bidId}/reject`;
    const res = await http.patch(path);
    return res.data;
  },
};
