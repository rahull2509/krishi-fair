const express = require('express');
const agroController = require('./agro.controller');

const router = express.Router();

router.get('/weather', agroController.getCurrentWeather);
router.get('/forecast', agroController.getWeatherForecast);
router.post('/irrigation-advice', agroController.getIrrigationAdvice);
router.get('/soil', agroController.getSoilData);
router.get('/satellite', agroController.getSatelliteImagery);

module.exports = router;
