const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Получение данных профиля пользователя, включая его объявления
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userResult = await db.query('SELECT id, email, location FROM users WHERE id = $1', [userId]);
    const announcementsResult = await db.query('SELECT * FROM announcements WHERE user_id = $1 ORDER BY id DESC', [userId]);
    
    res.json({
      user: userResult.rows[0],
      announcements: announcementsResult.rows
    });
  } catch (err) {
    next(err);
  }
});

router.put('/me', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { children } = req.body;

    // Проверка, что children - это массив
    if (!Array.isArray(children)) {
      return res.status(400).json({ message: 'Поле children должно быть массивом' });
    }

    // Обновление данных пользователя в базе данных
    const result = await db.query(
      'UPDATE users SET children = $1 WHERE id = $2 RETURNING id, email, location, children',
      [JSON.stringify(children), userId]
    );

    // Отправка обновленных данных пользователя
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при обновлении профиля:', err);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

module.exports = router;