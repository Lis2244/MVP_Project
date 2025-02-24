const winston = require('winston');

// Создаем экземпляр логгера с необходимыми транспортами
const logger = winston.createLogger({
  level: 'info', // минимальный уровень логирования
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Запись ошибок в отдельный файл
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Общие логи в файл
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Если приложение не в продакшене, добавляем вывод в консоль
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;