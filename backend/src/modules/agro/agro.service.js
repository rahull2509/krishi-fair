const axios = require('axios');
const config = require('../../config');

class AgroService {
  constructor() {
    this.apiKey = config.agroApi.apiKey;
    this.baseUrl = config.agroApi.baseUrl;
  }

  /**
   * Get current weather for a location
   */
  async getCurrentWeather(lat, lon) {
    try {
      const url = `https://api.agromonitoring.com/agro/1.0/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data;

      return {
        temperature: {
          current: Math.round(data.main?.temp - 273.15) || 0,
          feelsLike: Math.round(data.main?.feels_like - 273.15) || 0,
          min: Math.round(data.main?.temp_min - 273.15) || 0,
          max: Math.round(data.main?.temp_max - 273.15) || 0,
        },
        humidity: data.main?.humidity || 0,
        windSpeed: data.wind?.speed || 0,
        description: data.weather?.[0]?.description || 'N/A',
        icon: data.weather?.[0]?.icon || '',
        pressure: data.main?.pressure || 0,
        clouds: data.clouds?.all || 0,
      };
    } catch (error) {
      console.error('Weather API Error:', error.message);
      return this.getFallbackWeather(lat, lon);
    }
  }

  /**
   * Get 5-day weather forecast
   */
  async getWeatherForecast(lat, lon) {
    try {
      const url = `https://api.agromonitoring.com/agro/1.0/weather/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
      const response = await axios.get(url, { timeout: 10000 });

      const forecast = (response.data || []).map(entry => ({
        date: new Date(entry.dt * 1000).toISOString(),
        temperature: Math.round(entry.main?.temp - 273.15) || 0,
        humidity: entry.main?.humidity || 0,
        description: entry.weather?.[0]?.description || 'N/A',
        windSpeed: entry.wind?.speed || 0,
        rain: entry.rain?.['3h'] || 0,
      }));

      return { forecast, location: { lat, lon } };
    } catch (error) {
      console.error('Forecast API Error:', error.message);
      return {
        forecast: this.getFallbackForecast(lat, lon),
        location: { lat, lon },
        isFallback: true,
      };
    }
  }

  /**
   * Get soil data
   */
  async getSoilData(polyId) {
    try {
      const url = `${this.baseUrl}/soil?polyid=${polyId}&appid=${this.apiKey}`;
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      console.error('Soil API Error:', error.message);
      return { error: 'Soil data unavailable' };
    }
  }

  /**
   * Get satellite imagery (NDVI, etc.)
   */
  async getSatelliteImagery(polyId) {
    try {
      const url = `${this.baseUrl}/image/search?start=0&end=${Math.floor(Date.now() / 1000)}&polyid=${polyId}&appid=${this.apiKey}`;
      const response = await axios.get(url, { timeout: 10000 });
      return response.data || [];
    } catch (error) {
      console.error('Satellite API Error:', error.message);
      return [];
    }
  }

  /**
   * AI-based irrigation advice using weather data
   */
  async getIrrigationAdvice(lat, lon, cropType) {
    try {
      const weather = await this.getCurrentWeather(lat, lon);

      const advice = this.generateIrrigationAdvice(weather, cropType);

      return {
        weather,
        cropType: cropType || 'General',
        advice,
        location: { lat, lon },
      };
    } catch (error) {
      console.error('Irrigation Advice Error:', error.message);
      return {
        advice: {
          shouldIrrigate: 'uncertain',
          reason: 'Could not fetch weather data. Check manually.',
          tips: ['Check soil moisture manually', 'Water in early morning or evening'],
        },
      };
    }
  }

  /**
   * Generate irrigation recommendation based on weather
   */
  generateIrrigationAdvice(weather, cropType) {
    const temp = weather.temperature?.current || 25;
    const humidity = weather.humidity || 50;
    const windSpeed = weather.windSpeed || 0;

    let shouldIrrigate = false;
    let reason = '';
    const tips = [];

    // High temp, low humidity = irrigate
    if (temp > 35 && humidity < 40) {
      shouldIrrigate = true;
      reason = 'तापमान बहुत ज़्यादा है और नमी कम है। सिंचाई ज़रूरी है। (High temperature and low humidity — irrigation needed)';
      tips.push('सुबह जल्दी या शाम को सिंचाई करें (Irrigate early morning or evening)');
      tips.push('ड्रिप सिंचाई बेहतर रहेगी (Drip irrigation recommended)');
    } else if (temp > 30 && humidity < 50) {
      shouldIrrigate = true;
      reason = 'गर्मी ज़्यादा है, हल्की सिंचाई करें। (Warm conditions — light irrigation recommended)';
      tips.push('मल्चिंग करें नमी बनाए रखने के लिए (Use mulching to retain moisture)');
    } else if (humidity > 80) {
      shouldIrrigate = false;
      reason = 'नमी पर्याप्त है, सिंचाई की ज़रूरत नहीं। (Humidity is sufficient — no irrigation needed)';
      tips.push('ज़्यादा पानी से फसल खराब हो सकती है (Over-watering can damage crops)');
    } else {
      shouldIrrigate = false;
      reason = 'मौसम सामान्य है, मिट्टी जांचें। (Normal conditions — check soil moisture)';
      tips.push('मिट्टी को छूकर जांचें — अगर सूखी हो तो सिंचाई करें (Touch test — irrigate if soil is dry)');
    }

    if (windSpeed > 15) {
      tips.push('हवा तेज़ है, स्प्रिंकलर सिंचाई से बचें (High wind — avoid sprinkler irrigation)');
    }

    // Crop-specific advice
    if (cropType) {
      const cropAdvice = this.getCropSpecificAdvice(cropType, temp, humidity);
      tips.push(...cropAdvice);
    }

    return {
      shouldIrrigate,
      reason,
      tips,
      conditions: {
        temperature: `${temp}°C`,
        humidity: `${humidity}%`,
        windSpeed: `${windSpeed} m/s`,
      },
    };
  }

  getCropSpecificAdvice(cropType, temp, humidity) {
    const cropLower = cropType.toLowerCase();
    const tips = [];

    if (['wheat', 'गेहूं'].includes(cropLower)) {
      tips.push('गेहूं में 4-6 सिंचाई ज़रूरी होती है (Wheat needs 4-6 irrigations)');
      if (temp < 10) tips.push('पाला पड़ने का खतरा — शाम को हल्की सिंचाई करें (Frost risk — light evening irrigation)');
    } else if (['rice', 'धान', 'चावल'].includes(cropLower)) {
      tips.push('धान में 5-7 सेमी पानी बनाए रखें (Maintain 5-7cm water level for paddy)');
    } else if (['potato', 'आलू'].includes(cropLower)) {
      tips.push('आलू में ज़्यादा पानी से सड़न हो सकती है (Excess water can cause potato rot)');
    } else if (['tomato', 'टमाटर'].includes(cropLower)) {
      tips.push('टमाटर में ड्रिप सिंचाई सबसे अच्छी (Drip irrigation best for tomatoes)');
    }

    return tips;
  }

  getFallbackWeather(lat = 28.61, lon = 77.2) {
    const seed = Math.abs(Math.round((Number(lat) + Number(lon)) * 10)) % 5;
    const descriptions = ['clear sky', 'partly cloudy', 'light rain', 'haze', 'scattered clouds'];
    const temp = 24 + seed * 2;

    return {
      temperature: { current: temp, feelsLike: temp + 1, min: temp - 3, max: temp + 4 },
      humidity: 55 + seed * 5,
      windSpeed: 4 + seed,
      description: descriptions[seed],
      icon: '',
      pressure: 1008 + seed,
      clouds: seed * 20,
      isFallback: true,
    };
  }

  getFallbackForecast(lat = 28.61, lon = 77.2) {
    const seed = Math.abs(Math.round((Number(lat) + Number(lon)) * 10)) % 5;
    const descriptions = ['clear sky', 'partly cloudy', 'light rain', 'haze', 'scattered clouds'];

    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      const conditionIndex = (seed + index) % descriptions.length;
      return {
        date: date.toISOString(),
        temperature: 24 + seed + (index % 4),
        humidity: 55 + conditionIndex * 6,
        description: descriptions[conditionIndex],
        windSpeed: 4 + conditionIndex,
        rain: descriptions[conditionIndex].includes('rain') ? 4 + index : 0,
        isFallback: true,
      };
    });
  }
}

module.exports = new AgroService();
