const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult, query } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { upload, processImage, uploadDir } = require('../upload');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/announcements
 * Получение списка объявлений с фильтрацией по названию, возрасту и городу.
 */
router.get(
  '/',
  query('search').optional(),
  query('age').optional(),
  query('city').optional(),
  async (req, res, next) => {
    try {
      const { search, age, city } = req.query;

      // Базовый запрос
      let queryText = `
        SELECT a.*, u.email 
        FROM announcements a 
        JOIN users u ON a.user_id = u.id 
        WHERE 1=1
      `;
      const queryParams = [];

      // Фильтрация по названию
      if (search) {
        queryText += ` AND a.title ILIKE $${queryParams.length + 1}`;
        queryParams.push(`%${search}%`);
      }

      // Фильтрация по возрасту
      if (age) {
        queryText += ` AND a.target_info = $${queryParams.length + 1}`;
        queryParams.push(age);
      }

      // Фильтрация по городу
      if (city) {
        queryText += ` AND a.location ILIKE $${queryParams.length + 1}`;
        queryParams.push(`%${city}%`);
      }

      // Сортировка по дате создания (новые сначала)
      queryText += ' ORDER BY a.id DESC';

      const result = await db.query(queryText, queryParams);
      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка при получении объявлений:', err);
      res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
  }
);

/**
 * GET /api/announcements/my
 * Получение списка объявлений текущего пользователя.
 */
router.get(
  '/my',
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({ message: 'ID пользователя не найден' });
      }

      const result = await db.query(
        `SELECT * FROM announcements WHERE user_id = $1 ORDER BY id DESC`,
        [userId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Ошибка при получении объявлений:', err);
      res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
  }
);

/**
 * GET /api/announcements/:id
 * Получение полного объявления по id.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID должен быть числом' });
    }

    const result = await db.query(
      `SELECT a.*, u.email FROM announcements a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Объявление не найдено' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при получении объявления:', err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
});

/**
 * POST /api/announcements
 * Создание нового объявления с обязательной загрузкой до 5 изображений.
 * Обязательные поля: title, description, categories, target_info, location.
 */
router.post(
  '/',
  authMiddleware,
  upload.array('images', 5),
  body('title').notEmpty().withMessage('Название обязательно'),
  body('description').notEmpty().withMessage('Описание обязательно'),
  body('categories').notEmpty().withMessage('Выберите хотя бы одну категорию'),
  body('target_info').notEmpty().withMessage('Информация о целевой аудитории обязательна'),
  body('location').notEmpty().withMessage('Город обязателен'),
  async (req, res, next) => {
    try {
      // Валидация полей
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Проверка наличия файлов
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Изображения обязательны для создания объявления' });
      }

      // Обработка файлов
      const processedFiles = [];
      for (const file of req.files) {
        const outputFileName = 'processed-' + file.filename;
        const outputFilePath = path.join(uploadDir, outputFileName);

        // Обработка изображения
        await processImage(file.path, outputFilePath);

        // Добавляем путь к обработанному файлу
        processedFiles.push(`/uploads/${outputFileName}`);

        // Удаляем оригинальный файл после обработки
        fs.unlinkSync(file.path);
      }

      // Сохранение объявления в базу данных
      const { title, description, categories, target_info, location } = req.body;
      const userId = req.user.id;

      const result = await db.query(
        `INSERT INTO announcements (title, description, categories, target_info, image_url, user_id, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [title, description, categories, target_info, JSON.stringify(processedFiles), userId, location]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Ошибка при создании объявления:', err);
      res.status(500).json({ message: 'Ошибка при создании объявления' });
    }
  }
);

/**
 * PUT /api/announcements/:id
 * Редактирование объявления. Пользователь может обновлять поля и изображения.
 */
router.put(
  '/:id',
  authMiddleware,
  upload.array('images', 5),
  async (req, res, next) => {
    try {
      const announcementId = req.params.id;
      const userId = req.user.id;

      if (isNaN(announcementId)) {
        return res.status(400).json({ message: 'ID должен быть числом' });
      }

      // Проверка прав доступа
      const { rows } = await db.query('SELECT * FROM announcements WHERE id = $1 AND user_id = $2', [announcementId, userId]);
      if (rows.length === 0) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }

      const announcement = rows[0];
      const { title, description, categories, target_info, location, imagesToDelete } = req.body;

      // Удаление указанных изображений
      if (imagesToDelete) {
        const imagesToDeleteArray = JSON.parse(imagesToDelete); // Преобразуем строку JSON в массив
        if (imagesToDeleteArray.length > 0) {
          imagesToDeleteArray.forEach(imagePath => {
            const fullPath = path.join(__dirname, '..', imagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          });

          // Обновляем список изображений
          const currentImages = JSON.parse(announcement.image_url);
          const updatedImages = currentImages.filter(image => !imagesToDeleteArray.includes(image));
          announcement.image_url = JSON.stringify(updatedImages);
        }
      }

      // Добавление новых изображений
      let imageUrlsJson = announcement.image_url;
      if (req.files && req.files.length > 0) {
        const processedFiles = [];
        for (const file of req.files) {
          const outputFileName = 'processed-' + file.filename;
          const outputFilePath = path.join(uploadDir, outputFileName);
          await processImage(file.path, outputFilePath);
          processedFiles.push(`/uploads/${outputFileName}`);
        }

        const currentImages = JSON.parse(imageUrlsJson);
        const newImages = [...currentImages, ...processedFiles];

        // Проверка на максимальное количество изображений (5)
        if (newImages.length > 5) {
          return res.status(400).json({ message: 'Максимальное количество изображений — 5' });
        }

        imageUrlsJson = JSON.stringify(newImages);
      }

      // Подготовка полей для обновления
      const fields = [];
      const values = [];
      let idx = 1;
      if (title) {
        fields.push(`title = $${idx++}`);
        values.push(title);
      }
      if (description) {
        fields.push(`description = $${idx++}`);
        values.push(description);
      }
      if (categories) {
        fields.push(`categories = $${idx++}`);
        values.push(categories);
      }
      if (target_info) {
        fields.push(`target_info = $${idx++}`);
        values.push(target_info);
      }
      if (location) {
        fields.push(`location = $${idx++}`);
        values.push(location);
      }
      if (imageUrlsJson) {
        fields.push(`image_url = $${idx++}`);
        values.push(imageUrlsJson);
      }
      if (fields.length === 0) {
        return res.status(400).json({ message: 'Нет данных для обновления' });
      }

      values.push(announcementId, userId);
      const queryText = `UPDATE announcements SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`;
      const updateResult = await db.query(queryText, values);
      res.json(updateResult.rows[0]);
    } catch (err) {
      console.error('Ошибка при обновлении объявления:', err);
      res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
  }
);

/**
 * DELETE /api/announcements/:id
 * Удаление объявления, если оно принадлежит пользователю.
 */
router.delete(
  '/:id',
  authMiddleware,
  async (req, res, next) => {
    try {
      const announcementId = req.params.id;
      const userId = req.user.id;

      if (isNaN(announcementId)) {
        return res.status(400).json({ message: 'ID должен быть числом' });
      }

      // Проверка прав доступа
      const { rows } = await db.query('SELECT * FROM announcements WHERE id = $1 AND user_id = $2', [announcementId, userId]);
      if (rows.length === 0) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }

      const announcement = rows[0];

      // Удаление связанных изображений
      if (announcement.image_url) {
        const imagePaths = JSON.parse(announcement.image_url);
        imagePaths.forEach(imagePath => {
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }

      // Удаление объявления из базы данных
      await db.query('DELETE FROM announcements WHERE id = $1 AND user_id = $2', [announcementId, userId]);
      res.json({ message: 'Объявление успешно удалено' });
    } catch (err) {
      console.error('Ошибка при удалении объявления:', err);
      res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
  }
);

module.exports = router;