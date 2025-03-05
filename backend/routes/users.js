const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const path = require('path'); // Для работы с путями к файлам
const fs = require('fs'); // Для работы с файловой системой

// Получение данных профиля пользователя, включая его объявления
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Получаем данные пользователя
    const userResult = await db.query(
      'SELECT id, email, location, children FROM users WHERE id = $1',
      [userId]
    );

    // Получаем объявления пользователя
    const announcementsResult = await db.query(
      'SELECT * FROM announcements WHERE user_id = $1 ORDER BY id DESC',
      [userId]
    );

    // Возвращаем данные пользователя и его объявления
    res.json({
      user: userResult.rows[0],
      announcements: announcementsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// Обновление данных профиля пользователя
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

// Удаление профиля пользователя
router.delete('/me', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Получаем все объявления пользователя
    const announcementsResult = await db.query(
      'SELECT * FROM announcements WHERE user_id = $1',
      [userId]
    );

    // Удаляем изображения, связанные с объявлениями
    for (const announcement of announcementsResult.rows) {
      if (announcement.image_url) {
        try {
          const imagePaths = JSON.parse(announcement.image_url);

          // Удаляем каждый файл
          imagePaths.forEach((imagePath) => {
            const fullPath = path.join(__dirname, '..', imagePath); // Полный путь к файлу
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath); // Удаляем файл
              console.log('Файл удален:', fullPath);
            } else {
              console.log('Файл не найден:', fullPath);
            }
          });
        } catch (error) {
          console.error('Ошибка при удалении файлов:', error);
        }
      }
    }

    // Удаляем все объявления пользователя
    await db.query('DELETE FROM announcements WHERE user_id = $1', [userId]);

    // Удаляем пользователя
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    // Отправляем успешный ответ
    res.json({ message: 'Профиль успешно удален' });
  } catch (err) {
    console.error('Ошибка при удалении профиля:', err);
    res.status(500).json({ message: 'Ошибка при удалении профиля' });
  }
});

module.exports = router;