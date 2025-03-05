const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нет токена, авторизация отклонена' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ message: 'Токен истёк' });
    }
    req.user = decoded; // decoded должен содержать id пользователя
    next();
  } catch (err) {
    res.status(401).json({ message: 'Неверный токен' });
  }
};