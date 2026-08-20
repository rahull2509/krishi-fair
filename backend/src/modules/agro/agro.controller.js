const agroService = require('./agro.service');
const ApiResponse = require('../../utils/apiResponse');

class AgroController {
  /** GET /api/agro/weather?lat=X&lon=Y */
  async getCurrentWeather(req, res, next) {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return ApiResponse.error(res, 'lat and lon are required', 400);
      }
      const weather = await agroService.getCurrentWeather(lat, lon);
      return ApiResponse.success(res, weather, 'Weather data fetched');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/agro/forecast?lat=X&lon=Y */
  async getWeatherForecast(req, res, next) {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return ApiResponse.error(res, 'lat and lon are required', 400);
      }
      const forecast = await agroService.getWeatherForecast(lat, lon);
      return ApiResponse.success(res, forecast, 'Forecast data fetched');
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/agro/irrigation-advice */
  async getIrrigationAdvice(req, res, next) {
    try {
      const { lat, lon, cropType } = req.body;
      if (!lat || !lon) {
        return ApiResponse.error(res, 'lat and lon are required', 400);
      }
      const advice = await agroService.getIrrigationAdvice(lat, lon, cropType);
      return ApiResponse.success(res, advice, 'Irrigation advice generated');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/agro/soil?polyId=X or ?lat=X&lon=Y */
  async getSoilData(req, res, next) {
    try {
      const { polyId, lat, lon } = req.query;
      // Accept lat/lon as an alternative to polyId
      const resolvedPolyId = polyId || (lat && lon ? `loc_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}` : null);
      if (!resolvedPolyId) {
        return ApiResponse.error(res, 'polyId or lat/lon are required', 400);
      }
      const soil = await agroService.getSoilData(resolvedPolyId);
      return ApiResponse.success(res, soil, 'Soil data fetched');
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/agro/satellite?polyId=X or ?lat=X&lon=Y */
  async getSatelliteImagery(req, res, next) {
    try {
      const { polyId, lat, lon } = req.query;
      const resolvedPolyId = polyId || (lat && lon ? `loc_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}` : null);
      if (!resolvedPolyId) {
        return ApiResponse.error(res, 'polyId or lat/lon are required', 400);
      }
      const images = await agroService.getSatelliteImagery(resolvedPolyId);
      return ApiResponse.success(res, images, 'Satellite imagery fetched');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AgroController();
