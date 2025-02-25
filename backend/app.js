const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Парсинг JSON и CORS
app.use(express.json());
app.use(cors());

const morgan = require('morgan');
const logger = require('./logger'); // Если logger.js находится в корне backend

// Добавляем middleware morgan для логирования HTTP-запросов через winston
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Раздача статичных файлов (например, обработанных изображений)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Обслуживание статических файлов из папки frontend/build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Подключаем маршруты
const authRoutes = require('./routes/auth');
const announcementRoutes = require('./routes/announcements');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/users', userRoutes);

// Корневой маршрут для проверки работы API
app.get('/', (req, res) => {
  res.send('API is running');
});

// Маршрут для всех остальных запросов (чтобы React Router работал на фронтенде)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});