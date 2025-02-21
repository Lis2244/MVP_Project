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

module.exports = router;