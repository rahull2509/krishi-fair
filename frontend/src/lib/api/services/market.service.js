import { USE_MOCK, http, delay } from "@/lib/api/client";

// Mock AGMARKNET-style data, mirrors api.data.gov.in resource shape
const MOCK_RECORDS = [
  ["Punjab","Amritsar","Amritsar Mandi","Wheat","HD-2967",2400,2650,2520,"2026-02-12","Quintal"],
  ["Punjab","Ludhiana","Ludhiana Mandi","Wheat","HD-3086",2380,2600,2495,"2026-02-12","Quintal"],
  ["Haryana","Karnal","Karnal Mandi","Rice","Pusa 1121",3300,3650,3475,"2026-02-12","Quintal"],
  ["Haryana","Karnal","Karnal Mandi","Mustard","Pusa Bold",4900,5300,5125,"2026-02-12","Quintal"],
  ["Maharashtra","Nashik","Nashik APMC","Onion","N-53",1500,1900,1740,"2026-02-12","Quintal"],
  ["Maharashtra","Pune","Manchar","Onion","N-2-4-1",1450,1850,1690,"2026-02-12","Quintal"],
  ["Maharashtra","Nashik","Lasalgaon","Tomato","Hybrid",1100,1500,1320,"2026-02-12","Quintal"],
  ["Uttar Pradesh","Lucknow","Lucknow Mandi","Potato","Desi",1200,1500,1350,"2026-02-12","Quintal"],
  ["Uttar Pradesh","Agra","Agra Mandi","Potato","Hybrid",1180,1480,1330,"2026-02-12","Quintal"],
  ["Karnataka","Bangalore","Bengaluru APMC","Tomato","Hybrid",950,1400,1180,"2026-02-12","Quintal"],
  ["Karnataka","Mysore","Mysore APMC","Ragi","Local",3100,3400,3250,"2026-02-12","Quintal"],
  ["Tamil Nadu","Coimbatore","Coimbatore",  "Coconut","Big",2200,2600,2400,"2026-02-12","Quintal"],
  ["Tamil Nadu","Erode","Erode Mandi","Turmeric","Salem",13500,14800,14150,"2026-02-12","Quintal"],
  ["Gujarat","Rajkot","Rajkot APMC","Cotton","Shankar 6",6800,7400,7100,"2026-02-12","Quintal"],
  ["Gujarat","Ahmedabad","Ahmedabad","Groundnut","Bold",5500,6100,5800,"2026-02-12","Quintal"],
  ["Rajasthan","Jodhpur","Jodhpur Mandi","Cumin","Desi",24000,28500,26200,"2026-02-12","Quintal"],
  ["Rajasthan","Kota","Kota Mandi","Soybean","JS-335",4500,4900,4700,"2026-02-12","Quintal"],
  ["Madhya Pradesh","Indore","Indore Mandi","Soybean","JS-95",4400,4850,4625,"2026-02-12","Quintal"],
  ["Madhya Pradesh","Bhopal","Bhopal Mandi","Wheat","Sharbati",2700,3050,2880,"2026-02-12","Quintal"],
  ["Bihar","Patna","Patna Mandi","Maize","Hybrid",1900,2200,2050,"2026-02-12","Quintal"],
  ["West Bengal","Kolkata","Kolkata Mandi","Jute","TD-5",4400,4850,4625,"2026-02-12","Quintal"],
  ["Andhra Pradesh","Guntur","Guntur Mandi","Chilli","Teja",18000,21500,19800,"2026-02-12","Quintal"],
];

const HEADERS = [
  "state","district","market","commodity","variety",
  "min_price","max_price","modal_price","arrival_date","unit",
];

function asRecords() {
  return MOCK_RECORDS.map((row) =>
    Object.fromEntries(HEADERS.map((h, i) => [h, row[i]]))
  );
}

function normalizeRecord(record) {
  return {
    ...record,
    state: record.state || record.State || "",
    district: record.district || record.District || "",
    market: record.market || record.Market || "",
    commodity: record.commodity || record.Commodity || "",
    variety: record.variety || record.Variety || "",
    arrival_date: record.arrival_date || record.arrivalDate || record.Arrival_Date || "",
    min_price: Number(record.min_price ?? record.minPrice ?? record.Min_Price ?? 0),
    max_price: Number(record.max_price ?? record.maxPrice ?? record.Max_Price ?? 0),
    modal_price: Number(record.modal_price ?? record.modalPrice ?? record.Modal_Price ?? 0),
    unit: record.unit || "Quintal",
  };
}

function normalizeTrend(payload, commodity, state) {
  const data = payload?.data || {};
  const rawPoints = data.points || data.trends || [];
  const points = rawPoints
    .map((p) => ({
      date: p.date,
      modal_price: Number(p.modal_price ?? p.avgPrice ?? p.modalPrice ?? 0),
    }))
    .filter((p) => p.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    ...payload,
    data: {
      commodity: data.commodity || commodity,
      state: data.state || state || "All India",
      points,
    },
  };
}

export const marketService = {
  async getPrices({ commodity, state, district, market, q, limit = 100, sort } = {}) {
    if (USE_MOCK) {
      await delay();
      let recs = asRecords();
      if (commodity)
        recs = recs.filter((r) =>
          r.commodity.toLowerCase().includes(commodity.toLowerCase())
        );
      if (state)
        recs = recs.filter((r) =>
          r.state.toLowerCase().includes(state.toLowerCase())
        );
      if (district)
        recs = recs.filter((r) =>
          r.district.toLowerCase().includes(district.toLowerCase())
        );
      if (market)
        recs = recs.filter((r) =>
          r.market.toLowerCase().includes(market.toLowerCase())
        );
      if (q) {
        const query = q.toLowerCase();
        recs = recs.filter((r) =>
          r.commodity.toLowerCase().includes(query) ||
          r.market.toLowerCase().includes(query) ||
          r.district.toLowerCase().includes(query) ||
          r.state.toLowerCase().includes(query) ||
          r.variety.toLowerCase().includes(query)
        );
      }
      if (sort === "latest") {
        recs = [...recs].sort(
          (a, b) => new Date(b.arrival_date) - new Date(a.arrival_date)
        );
      }
      return {
        success: true,
        data: { records: recs.slice(0, limit), count: recs.length },
      };
    }
    const params = new URLSearchParams();
    Object.entries({ commodity, state, district, market, q, limit, sort }).forEach(
      ([k, v]) => v != null && v !== "" && params.append(k, v)
    );
    const res = await http.get(`/market/prices?${params.toString()}`);
    const records = (res.data?.data?.records || []).map(normalizeRecord);
    return {
      ...res.data,
      data: {
        ...res.data?.data,
        records,
        count: res.data?.data?.count ?? records.length,
      },
    };
  },

  async search(q) {
    if (USE_MOCK) {
      await delay();
      const recs = asRecords().filter(
        (r) =>
          r.commodity.toLowerCase().includes(q.toLowerCase()) ||
          r.market.toLowerCase().includes(q.toLowerCase())
      );
      return { success: true, data: { records: recs, count: recs.length } };
    }
    const res = await http.get(`/market/search?q=${encodeURIComponent(q)}`);
    const records = (res.data?.data?.records || []).map(normalizeRecord);
    return { ...res.data, data: { ...res.data?.data, records, count: records.length } };
  },

  async trends({ commodity, state }) {
    if (USE_MOCK) {
      await delay();
      // generate 14-day trend deterministically from params
      const seed = (commodity + state).length;
      const today = new Date();
      const points = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (13 - i));
        const noise = Math.sin(i + seed) * 80;
        const base = 2400 + (commodity?.length || 0) * 25;
        return {
          date: d.toISOString().slice(0, 10),
          modal_price: Math.round(base + noise + i * 4),
        };
      });
      return { success: true, data: { commodity, state, points } };
    }
    const params = new URLSearchParams();
    if (commodity) params.append("commodity", commodity);
    if (state) params.append("state", state);
    const res = await http.get(`/market/trends?${params.toString()}`);
    return normalizeTrend(res.data, commodity, state);
  },
};
