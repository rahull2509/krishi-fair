import { USE_MOCK, http, delay } from "@/lib/api/client";

const conditions = [
  { code: "clear", label: "Clear", icon: "sun" },
  { code: "partly", label: "Partly cloudy", icon: "cloud-sun" },
  { code: "rain", label: "Light rain", icon: "cloud-rain" },
  { code: "thunder", label: "Thunderstorm", icon: "cloud-lightning" },
  { code: "haze", label: "Haze", icon: "haze" },
];

function dailyForecast(seed = 0) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const base = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const c = conditions[(i + seed) % conditions.length];
    return {
      date: d.toISOString().slice(0, 10),
      day: days[(d.getDay() + 6) % 7],
      tempMin: 14 + ((i + seed) % 5),
      tempMax: 24 + ((i * 2 + seed) % 8),
      condition: c.label,
      icon: c.icon,
      rainMm: c.code === "rain" ? 4 + i : c.code === "thunder" ? 12 : 0,
    };
  });
}

function iconFromDescription(description = "") {
  const text = description.toLowerCase();
  if (text.includes("thunder")) return "cloud-lightning";
  if (text.includes("rain")) return "cloud-rain";
  if (text.includes("cloud")) return "cloud-sun";
  if (text.includes("haze") || text.includes("mist") || text.includes("fog")) return "haze";
  return "sun";
}

function dayName(date) {
  return new Date(date).toLocaleDateString("en-US", { weekday: "short" });
}

function normalizeWeather(payload, lat, lon) {
  const data = payload?.data || {};
  const temp = data.temperature || {};
  return {
    ...payload,
    data: {
      lat,
      lon,
      temp: Number(data.temp ?? temp.current ?? 0),
      feels_like: Number(data.feels_like ?? temp.feelsLike ?? temp.current ?? 0),
      humidity: Number(data.humidity ?? 0),
      wind: Number(data.wind ?? data.windSpeed ?? 0),
      condition: data.condition || data.description || "Weather unavailable",
      icon: data.icon && data.icon.length <= 4 ? iconFromDescription(data.description) : data.icon || iconFromDescription(data.description),
      updatedAt: data.updatedAt || new Date().toISOString(),
    },
  };
}

function normalizeForecast(payload) {
  const raw = payload?.data?.points || payload?.data?.forecast || [];
  const byDate = new Map();

  raw.forEach((p) => {
    const date = (p.date || "").slice(0, 10);
    if (!date) return;
    const existing = byDate.get(date) || {
      date,
      day: dayName(date),
      tempMin: Number(p.tempMin ?? p.temperature ?? 0),
      tempMax: Number(p.tempMax ?? p.temperature ?? 0),
      condition: p.condition || p.description || "N/A",
      icon: p.icon || iconFromDescription(p.description),
      rainMm: 0,
    };
    const temp = Number(p.temperature ?? p.tempMax ?? existing.tempMax);
    existing.tempMin = Math.min(existing.tempMin, Number(p.tempMin ?? temp));
    existing.tempMax = Math.max(existing.tempMax, Number(p.tempMax ?? temp));
    existing.rainMm += Number(p.rainMm ?? p.rain ?? 0);
    if (p.description || p.condition) {
      existing.condition = p.condition || p.description;
      existing.icon = p.icon || iconFromDescription(existing.condition);
    }
    byDate.set(date, existing);
  });

  return {
    ...payload,
    data: {
      ...payload?.data,
      points: Array.from(byDate.values()).slice(0, 7),
    },
  };
}

function normalizeIrrigation(payload, cropType) {
  const data = payload?.data || {};
  const advice = data.advice || data;
  const recommended = advice.recommendedToday ?? advice.shouldIrrigate === true;
  return {
    ...payload,
    data: {
      cropType: data.cropType || cropType,
      recommendedToday: Boolean(recommended),
      minutes: Number(data.minutes ?? (recommended ? 35 : 0)),
      rationale: data.rationale || advice.reason || "Check field moisture before irrigation.",
      tips: advice.tips || [],
      nextCheck: data.nextCheck || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

function normalizeSoil(payload, polyId, lat, lon) {
  const data = payload?.data || {};
  return {
    ...payload,
    data: {
      polyId: data.polyId || data.polyid || polyId || `loc_${Number(lat).toFixed(2)}_${Number(lon).toFixed(2)}`,
      moisture: Number(data.moisture ?? 0),
      temperature: Number(data.temperature ?? data.t0 ?? 0),
      t10: Number(data.t10 ?? data.t10cm ?? data.temperature ?? 0),
      updatedAt: data.updatedAt || new Date().toISOString(),
    },
  };
}

export const agroService = {
  async currentWeather({ lat, lon }) {
    if (USE_MOCK) {
      await delay();
      const seed = Math.floor(((lat || 0) + (lon || 0)) * 10) % 5;
      const c = conditions[seed];
      return {
        success: true,
        data: {
          lat,
          lon,
          temp: 22 + seed,
          feels_like: 21 + seed,
          humidity: 55 + seed * 3,
          wind: 8 + seed,
          condition: c.label,
          icon: c.icon,
          updatedAt: new Date().toISOString(),
        },
      };
    }
    const res = await http.get(`/agro/weather?lat=${lat}&lon=${lon}`);
    return normalizeWeather(res.data, lat, lon);
  },

  async forecast({ lat, lon }) {
    if (USE_MOCK) {
      await delay();
      const seed = Math.floor(((lat || 0) + (lon || 0)) * 10) % 5;
      return { success: true, data: { points: dailyForecast(seed) } };
    }
    const res = await http.get(`/agro/forecast?lat=${lat}&lon=${lon}`);
    return normalizeForecast(res.data);
  },

  async irrigationAdvice({ lat, lon, cropType }) {
    if (USE_MOCK) {
      await delay();
      const seed = Math.floor(((lat || 0) + (lon || 0)) * 10) % 5;
      const wantsRain = seed === 2;
      return {
        success: true,
        data: {
          cropType,
          recommendedToday: !wantsRain,
          minutes: wantsRain ? 0 : 35,
          rationale: wantsRain
            ? "Light to moderate rainfall expected within 24h. Skip irrigation today and re-evaluate tomorrow."
            : "Soil moisture below threshold for active growth. Drip irrigate for ~35 minutes in early morning.",
          nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      };
    }
    const res = await http.post(`/agro/irrigation-advice`, { lat, lon, cropType });
    return normalizeIrrigation(res.data, cropType);
  },

  async soil({ polyId, lat, lon }) {
    if (USE_MOCK) {
      await delay();
      const seed = Math.floor(((lat || 0) + (lon || 0)) * 10) % 5;
      return {
        success: true,
        data: {
          polyId: polyId || "MOCK_POLYGON",
          moisture: 0.18 + seed * 0.02,
          temperature: 18 + seed,
          t10: 21 + seed,
          updatedAt: new Date().toISOString(),
        },
      };
    }
    const params = new URLSearchParams();
    if (polyId) params.append("polyId", polyId);
    if (lat) params.append("lat", lat);
    if (lon) params.append("lon", lon);
    const res = await http.get(`/agro/soil?${params.toString()}`);
    return normalizeSoil(res.data, polyId, lat, lon);
  },
};
