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

function normalizeCrop(crop) {
  if (!crop) return crop;
  const imageIds = Array.isArray(crop.imageIds) ? crop.imageIds : [];
  return {
    ...crop,
    images: crop.images || imageIds,
    status: crop.status === "ACTIVE" ? "OPEN" : crop.status,
    bidsCount: crop.bidsCount ?? crop._count?.bids ?? 0,
    purchasesCount: crop.purchasesCount ?? crop._count?.purchases ?? 0,
  };
}

function normalizePaginatedResponse(payload, page, limit) {
  const rawItems = payload?.data?.items || payload?.data || [];
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeCrop) : [];
  return {
    ...payload,
    data: {
      items,
      total: payload?.data?.total ?? payload?.pagination?.total ?? items.length,
      page: payload?.data?.page ?? payload?.pagination?.page ?? page,
      limit: payload?.data?.limit ?? payload?.pagination?.limit ?? limit,
    },
    pagination: payload?.pagination,
  };
}

export const cropService = {
  async create(payload) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const uid = getCurrentUserId();
      if (!uid) throw new Error("Not authenticated");
      const settings = data.settings;
      const allowBidding = payload.allowBidding !== false;
      const crop = {
        id: db.uid("c"),
        farmerId: uid,
        title: payload.title,
        description: payload.description || "",
        category: payload.category,
        variety: payload.variety || "",
        quantity: Number(payload.quantity),
        unit: payload.unit || "quintal",
        basePrice: Number(payload.basePrice),
        minBidPrice: Number(payload.minBidPrice ?? payload.basePrice),
        allowBidding,
        location: payload.location || "",
        state: payload.state || "",
        district: payload.district || "",
        images: payload.images || [],
        status: "OPEN",
        biddingEndsAt: allowBidding
          ? new Date(
              Date.now() + settings.defaultBiddingDurationHours * 60 * 60 * 1000
            ).toISOString()
          : null,
        createdAt: new Date().toISOString(),
      };
      data.crops.unshift(crop);
      db.write(data);
      return { success: true, data: crop };
    }
    const res = await http.post("/crops", payload);
    return { ...res.data, data: normalizeCrop(res.data?.data) };
  },

  async list({
    page = 1,
    limit = 20,
    category,
    state,
    minPrice,
    maxPrice,
    biddingOnly,
    q,
  } = {}) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      let crops = data.crops.filter((c) => c.status !== "DELETED");
      if (category) crops = crops.filter((c) => c.category === category);
      if (state) crops = crops.filter((c) => c.state === state);
      if (minPrice) crops = crops.filter((c) => c.basePrice >= Number(minPrice));
      if (maxPrice) crops = crops.filter((c) => c.basePrice <= Number(maxPrice));
      if (biddingOnly) crops = crops.filter((c) => c.allowBidding);
      if (q) {
        const needle = q.toLowerCase();
        crops = crops.filter(
          (c) =>
            c.title.toLowerCase().includes(needle) ||
            (c.variety || "").toLowerCase().includes(needle) ||
            (c.category || "").toLowerCase().includes(needle)
        );
      }
      // attach farmer + bid stats
      const enriched = crops.map((c) => {
        const farmer = data.users.find((u) => u.id === c.farmerId);
        const bids = data.bids.filter((b) => b.cropId === c.id);
        const highest = bids.reduce(
          (m, b) => (b.amount > m ? b.amount : m),
          0
        );
        return {
          ...c,
          farmer: farmer
            ? {
                id: farmer.id,
                name: farmer.name,
                state: farmer.state,
                district: farmer.district,
              }
            : null,
          bidsCount: bids.length,
          highestBid: highest,
        };
      });
      const total = enriched.length;
      const start = (page - 1) * limit;
      return {
        success: true,
        data: {
          items: enriched.slice(start, start + limit),
          total,
          page,
          limit,
        },
      };
    }
    const params = new URLSearchParams();
    Object.entries({
      page,
      limit,
      category,
      state,
      minPrice,
      maxPrice,
      allowBidding: biddingOnly ? true : undefined,
      search: q,
    }).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, v);
    });
    const res = await http.get(`/crops?${params.toString()}`);
    return normalizePaginatedResponse(res.data, page, limit);
  },

  async getById(id) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const c = data.crops.find((x) => x.id === id);
      if (!c) throw new Error("Crop not found");
      const farmer = data.users.find((u) => u.id === c.farmerId);
      const bids = data.bids
        .filter((b) => b.cropId === id)
        .map((b) => {
          const buyer = data.users.find((u) => u.id === b.buyerId);
          return {
            ...b,
            buyer: buyer ? { id: buyer.id, name: buyer.name } : null,
          };
        })
        .sort((a, b) => b.amount - a.amount);
      const highest = bids.reduce((m, b) => (b.amount > m ? b.amount : m), 0);
      return {
        success: true,
        data: {
          ...c,
          farmer: farmer
            ? {
                id: farmer.id,
                name: farmer.name,
                phone: farmer.phone,
                state: farmer.state,
                district: farmer.district,
              }
            : null,
          bids,
          highestBid: highest,
        },
      };
    }
    const res = await http.get(`/crops/${id}`);
    return { ...res.data, data: normalizeCrop(res.data?.data) };
  },

  async myCrops() {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const uid = getCurrentUserId();
      const items = data.crops
        .filter((c) => c.farmerId === uid && c.status !== "DELETED")
        .map((c) => {
          const bids = data.bids.filter((b) => b.cropId === c.id);
          return {
            ...c,
            bidsCount: bids.length,
            highestBid: bids.reduce(
              (m, b) => (b.amount > m ? b.amount : m),
              0
            ),
          };
        });
      return { success: true, data: items };
    }
    const res = await http.get("/crops/my");
    const items = Array.isArray(res.data?.data) ? res.data.data.map(normalizeCrop) : [];
    return { ...res.data, data: items };
  },

  async update(id, patch) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const idx = data.crops.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Crop not found");
      data.crops[idx] = { ...data.crops[idx], ...patch };
      db.write(data);
      return { success: true, data: data.crops[idx] };
    }
    const res = await http.put(`/crops/${id}`, patch);
    return { ...res.data, data: normalizeCrop(res.data?.data) };
  },

  async remove(id) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const idx = data.crops.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Crop not found");
      data.crops[idx].status = "DELETED";
      db.write(data);
      return { success: true };
    }
    const res = await http.delete(`/crops/${id}`);
    return res.data;
  },

  async directPurchase(id, quantity) {
    if (USE_MOCK) {
      await delay();
      const data = db.read();
      const idx = data.crops.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Crop not found");
      const crop = data.crops[idx];
      const qty = Number(quantity);
      if (qty <= 0 || qty > crop.quantity)
        throw new Error("Invalid quantity");
      crop.quantity -= qty;
      if (crop.quantity === 0) crop.status = "SOLD";
      const purchase = {
        id: db.uid("p"),
        cropId: id,
        buyerId: getCurrentUserId(),
        quantity: qty,
        amount: qty * crop.basePrice,
        createdAt: new Date().toISOString(),
      };
      data.purchases.push(purchase);
      db.write(data);
      return { success: true, data: purchase };
    }
    const res = await http.post(`/crops/${id}/buy`, { quantity });
    return res.data;
  },
};
