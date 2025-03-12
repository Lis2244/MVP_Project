const express = require('express');
const router = express.Router();
const cities = require('../data/cities'); // Импортируем список городов

// Маршрут для поиска городов
router.get('/', (req, res) => {
  const { search } = req.query; // Параметр поиска
  const filteredCities = cities
    .filter((city) => city.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 50); // Ограничиваем количество результатов
  res.json(filteredCities);
});

module.exports = router;