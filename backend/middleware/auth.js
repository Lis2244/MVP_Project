const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  console.log('Заголовок Authorization:', authHeader); // Отладочный вывод
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нет токена, авторизация отклонена' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Токен:', token); // Отладочный вывод

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Декодированный токен:', decoded); // Отладочный вывод

    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ message: 'Токен истёк' });
    }

    req.user = decoded; // Добавляем данные пользователя в запрос
    next();
  } catch (err) {
    console.error('Ошибка при проверке токена:', err); // Отладочный вывод
    res.status(401).json({ message: 'Неверный токен' });
  }
};