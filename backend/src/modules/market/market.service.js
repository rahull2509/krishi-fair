const axios = require('axios');
const config = require('../../config');
const prisma = require('../../config/database');

const FALLBACK_MARKET_ROWS = [
  ['Punjab', 'Amritsar', 'Amritsar Mandi', 'Wheat', 'HD-2967', 2400, 2650, 2520, '2026-02-12', 'Quintal'],
  ['Punjab', 'Ludhiana', 'Ludhiana Mandi', 'Wheat', 'HD-3086', 2380, 2600, 2495, '2026-02-12', 'Quintal'],
  ['Haryana', 'Karnal', 'Karnal Mandi', 'Rice', 'Pusa 1121', 3300, 3650, 3475, '2026-02-12', 'Quintal'],
  ['Maharashtra', 'Nashik', 'Lasalgaon', 'Tomato', 'Hybrid', 1100, 1500, 1320, '2026-02-12', 'Quintal'],
  ['Maharashtra', 'Nashik', 'Nashik APMC', 'Onion', 'N-53', 1500, 1900, 1740, '2026-02-12', 'Quintal'],
  ['Uttar Pradesh', 'Lucknow', 'Lucknow Mandi', 'Potato', 'Desi', 1200, 1500, 1350, '2026-02-12', 'Quintal'],
  ['Karnataka', 'Bangalore', 'Bengaluru APMC', 'Tomato', 'Hybrid', 950, 1400, 1180, '2026-02-12', 'Quintal'],
  ['Tamil Nadu', 'Erode', 'Erode Mandi', 'Turmeric', 'Salem', 13500, 14800, 14150, '2026-02-12', 'Quintal'],
  ['Gujarat', 'Rajkot', 'Rajkot APMC', 'Cotton', 'Shankar 6', 6800, 7400, 7100, '2026-02-12', 'Quintal'],
  ['Rajasthan', 'Jodhpur', 'Jodhpur Mandi', 'Cumin', 'Desi', 24000, 28500, 26200, '2026-02-12', 'Quintal'],
  ['Madhya Pradesh', 'Indore', 'Indore Mandi', 'Soybean', 'JS-335', 4400, 4850, 4625, '2026-02-12', 'Quintal'],
  ['Andhra Pradesh', 'Guntur', 'Guntur Mandi', 'Chilli', 'Teja', 18000, 21500, 19800, '2026-02-12', 'Quintal'],
];

const FALLBACK_HEADERS = [
  'state', 'district', 'market', 'commodity', 'variety',
  'min_price', 'max_price', 'modal_price', 'arrival_date', 'unit',
];

const FALLBACK_MARKET_RECORDS = FALLBACK_MARKET_ROWS.map(row =>
  Object.fromEntries(FALLBACK_HEADERS.map((header, index) => [header, row[index]]))
);

class MarketService {
  constructor() {
    this.apiKey = config.govApi.apiKey;
    this.resourceId = config.govApi.resourceId;
    this.baseUrl = config.govApi.baseUrl;
  }

  /**
   * Get mandi prices from data.gov.in AGMARKNET API
   */
  async getMandiPrices({ commodity, state, district, market, q, limit = 50, offset = 0, sort }) {
    try {
      const data = q
        ? await this.searchLiveMandiRecords({ q, commodity, state, district, market, limit, sort })
        : await this.fetchLiveMandiPrices({ commodity, state, district, market, limit, offset, sort });

      const records = this.normalizeRecords(data.records || []);

      // Cache results
      if (config.market.cacheEnabled && records.length > 0) {
        this.cacheResults(records).catch(err =>
          console.error('Cache error:', err.message)
        );
      }

      if (records.length === 0) {
        return await this.getCachedOrFallbackPrices({ commodity, state, district, market, q, limit, offset, sort });
      }

      return {
        records,
        total: data.total || data.count || 0,
        offset: parseInt(offset),
        limit: parseInt(limit),
        source: 'AGMARKNET (data.gov.in)',
      };
    } catch (error) {
      console.error('AGMARKNET API Error:', error.message);
      return await this.getCachedOrFallbackPrices({ commodity, state, district, market, q, limit, offset, sort });
    }
  }

  /**
   * Search commodities
   */
  async searchCommodity(query) {
    try {
      const data = await this.searchLiveMandiRecords({ q: query, limit: 100, sort: 'latest' });
      const records = this.normalizeRecords(data.records || []);

      return {
        records,
        total: records.length,
        query,
        source: 'AGMARKNET (data.gov.in)',
      };
    } catch (error) {
      console.error('Search Error:', error.message);
      const records = this.filterFallbackRecords({ q: query });
      return {
        records,
        total: records.length,
        query,
        source: 'Fallback sample data (search API temporarily unavailable)',
      };
    }
  }

  /**
   * Get price trends for a commodity
   */
  async getPriceTrends(commodity, state, days = 30) {
    try {
      const params = {
        'api-key': this.apiKey,
        format: 'json',
        limit: 500,
        'filters[commodity]': commodity,
        'sort[Arrival_Date]': 'desc',
      };

      if (state) params['filters[state]'] = state;

      const url = `${this.baseUrl}/resource/${this.resourceId}`;
      const response = await axios.get(url, { params, timeout: 15000 });
      const records = this.normalizeRecords(response.data.records || []);

      if (records.length === 0) {
        return this.getFallbackTrends(commodity, state, days);
      }

      // Group by date and calculate averages
      const dateMap = {};
      records.forEach(r => {
        const date = r.arrival_date;
        if (!dateMap[date]) {
          dateMap[date] = { prices: [], count: 0 };
        }
        dateMap[date].prices.push(parseFloat(r.modal_price) || 0);
        dateMap[date].count++;
      });

      const trends = Object.entries(dateMap).map(([date, data]) => ({
        date,
        avgPrice: Math.round(data.prices.reduce((a, b) => a + b, 0) / data.prices.length),
        sampleCount: data.count,
      })).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, days);

      return {
        commodity,
        state: state || 'All India',
        trends,
      };
    } catch (error) {
      console.error('Trends Error:', error.message);
      return this.getFallbackTrends(commodity, state, days);
    }
  }

  /**
   * Cache market prices in DB
   */
  async cacheResults(records) {
    if (!config.market.cacheEnabled) return;

    const cacheData = this.normalizeRecords(records).slice(0, 50).map(r => ({
      commodity: r.commodity || '',
      state: r.state || '',
      district: r.district || '',
      market: r.market || '',
      variety: r.variety || '',
      minPrice: r.min_price ? String(r.min_price) : '',
      maxPrice: r.max_price ? String(r.max_price) : '',
      modalPrice: r.modal_price ? String(r.modal_price) : '',
      arrivalDate: r.arrival_date || '',
      unit: 'Quintal',
    }));

    // Delete old cache for these commodities
    const commodities = [...new Set(cacheData.map(c => c.commodity))];
    for (const commodity of commodities) {
      await prisma.marketPriceCache.deleteMany({
        where: { commodity },
      });
    }

    // Insert new cache
    await prisma.marketPriceCache.createMany({
      data: cacheData,
    });
  }

  /**
   * Get cached prices
   */
  async getCachedPrices({ commodity, state }) {
    if (!config.market.cacheEnabled) return [];

    const where = {};
    if (commodity) where.commodity = commodity;
    if (state) where.state = state;

    try {
      return await prisma.marketPriceCache.findMany({
        where,
        orderBy: { fetchedAt: 'desc' },
        take: 50,
      });
    } catch (error) {
      console.error('Market cache read error:', error.message);
      return [];
    }
  }

  async fetchLiveMandiPrices({ commodity, state, district, market, limit = 50, offset = 0, sort }) {
    const params = {
      'api-key': this.apiKey,
      format: 'json',
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    if (commodity) params['filters[commodity]'] = commodity;
    if (state) params['filters[state]'] = state;
    if (district) params['filters[district]'] = district;
    if (market) params['filters[market]'] = market;

    if (sort === 'latest') {
      params['sort[Arrival_Date]'] = 'desc';
    }

    const url = `${this.baseUrl}/resource/${this.resourceId}`;
    const response = await axios.get(url, { params, timeout: 15000 });
    return response.data || {};
  }

  async searchLiveMandiRecords({ q, commodity, state, district, market, limit = 100, sort }) {
    const search = String(q || '').trim();
    if (!search) {
      return this.fetchLiveMandiPrices({ commodity, state, district, market, limit, sort });
    }

    const requestLimit = Math.max(parseInt(limit) || 100, 200);
    const exactSearches = ['market', 'district', 'commodity'].map(field => {
      const filters = { commodity, state, district, market, limit: requestLimit, sort };
      filters[field] = search;
      return this.fetchLiveMandiPrices(filters);
    });

    const broadSearch = this.fetchLiveMandiPrices({
      commodity,
      state,
      district,
      market,
      limit: Math.max(requestLimit, 1000),
      sort,
    });

    const results = await Promise.allSettled([...exactSearches, broadSearch]);
    const records = results.flatMap(result =>
      result.status === 'fulfilled' ? this.normalizeRecords(result.value.records || []) : []
    );

    const filtered = records.filter(record =>
      this.recordMatchesQuery(record, search)
    );

    const unique = Array.from(new Map(filtered.map(record =>
      [`${record.state}|${record.district}|${record.market}|${record.commodity}|${record.variety}|${record.arrival_date}`, record]
    )).values());

    return {
      records: unique.slice(0, parseInt(limit) || 100),
      total: unique.length,
      count: unique.length,
    };
  }

  async getCachedOrFallbackPrices({ commodity, state, district, market, q, limit = 50, offset = 0, sort }) {
    const cached = await this.getCachedPrices({ commodity, state });
    const cachedRecords = this.normalizeRecords(cached).filter(record =>
      this.recordMatchesFilters(record, { commodity, state, district, market, q })
    );

    if (cachedRecords.length > 0) {
      return {
        records: cachedRecords,
        total: cachedRecords.length,
        offset: parseInt(offset) || 0,
        limit: parseInt(limit) || 50,
        source: 'Cache (AGMARKNET temporarily unavailable or empty)',
      };
    }

    return this.getFallbackPrices({ commodity, state, district, market, q, limit, offset, sort });
  }

  normalizeRecords(records) {
    return (records || []).map(record => ({
      state: record.state || record.State || '',
      district: record.district || record.District || '',
      market: record.market || record.Market || '',
      commodity: record.commodity || record.Commodity || '',
      variety: record.variety || record.Variety || '',
      grade: record.grade || record.Grade || '',
      arrival_date: record.arrival_date || record.arrivalDate || record.Arrival_Date || '',
      min_price: Number(record.min_price ?? record.minPrice ?? record.Min_Price ?? 0),
      max_price: Number(record.max_price ?? record.maxPrice ?? record.Max_Price ?? 0),
      modal_price: Number(record.modal_price ?? record.modalPrice ?? record.Modal_Price ?? 0),
      commodity_code: record.commodity_code || record.commodityCode || record.Commodity_Code || '',
      unit: record.unit || 'Quintal',
    }));
  }

  recordMatchesQuery(record, q) {
    const query = String(q || '').trim().toLowerCase();
    if (!query) return true;

    return [record.market, record.district, record.state, record.commodity, record.variety]
      .some(value => String(value || '').toLowerCase().includes(query));
  }

  recordMatchesFilters(record, { commodity, state, district, market, q }) {
    const includes = (value, search) =>
      !search || String(value || '').toLowerCase().includes(String(search).toLowerCase());

    return includes(record.commodity, commodity) &&
      includes(record.state, state) &&
      includes(record.district, district) &&
      includes(record.market, market) &&
      this.recordMatchesQuery(record, q);
  }

  filterFallbackRecords({ commodity, state, district, market, q }) {
    const includes = (value, search) =>
      !search || String(value || '').toLowerCase().includes(String(search).toLowerCase());

    return FALLBACK_MARKET_RECORDS.filter(record =>
      includes(record.commodity, commodity) &&
      includes(record.state, state) &&
      includes(record.district, district) &&
      includes(record.market, market) &&
      this.recordMatchesQuery(record, q)
    );
  }

  getFallbackPrices({ commodity, state, district, market, q, limit = 50, offset = 0, sort }) {
    let records = this.filterFallbackRecords({ commodity, state, district, market, q });

    if (sort === 'latest') {
      records = [...records].sort((a, b) => new Date(b.arrival_date) - new Date(a.arrival_date));
    }

    const start = parseInt(offset) || 0;
    const take = parseInt(limit) || 50;

    return {
      records: records.slice(start, start + take),
      total: records.length,
      offset: start,
      limit: take,
      source: 'Fallback sample data (AGMARKNET temporarily unavailable)',
    };
  }

  getFallbackTrends(commodity, state, days = 30) {
    const count = Math.min(parseInt(days) || 30, 30);
    const seed = `${commodity || ''}${state || ''}`.length;
    const baseRecord = this.filterFallbackRecords({ commodity, state })[0];
    const base = Number(baseRecord?.modal_price) || 2400;

    const trends = Array.from({ length: count }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      return {
        date: date.toISOString().slice(0, 10),
        avgPrice: Math.round(base + Math.sin(index + seed) * 80 + (count - index) * 3),
        sampleCount: 1,
      };
    });

    return {
      commodity,
      state: state || 'All India',
      trends,
      source: 'Fallback sample data (trends API temporarily unavailable)',
    };
  }
}

module.exports = new MarketService();
