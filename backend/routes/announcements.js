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
 * Получение списка объявлений с фильтрацией по названию.
 */
router.get(
  '/',
  query('search').optional(),
  async (req, res, next) => {
    try {
      const search = req.query.search || '';
      const result = await db.query(
        `SELECT a.*, u.email FROM announcements a 
         JOIN users u ON a.user_id = u.id 
         WHERE a.title ILIKE $1 
         ORDER BY a.id DESC`,
        [`%${search}%`]
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
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
    next(err);
  }
});

/**
 * POST /api/announcements
 * Создание нового объявления с обязательной загрузкой до 5 изображений.
 * Обязательные поля: title, description, categories, target_info, а также хотя бы одно изображение.
 */
router.post(
  '/',
  authMiddleware,
  upload.array('images', 5),
  (req, res, next) => {
    // Логирование запроса
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);
    next();
  },
  body('title').notEmpty().withMessage('Название обязательно'),
  body('description').notEmpty().withMessage('Описание обязательно'),
  body('categories').notEmpty().withMessage('Выберите хотя бы одну категорию'),
  body('target_info').notEmpty().withMessage('Информация о целевой аудитории обязательна'),
  async (req, res, next) => {
    try {
      // Валидация полей
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      // Проверка наличия файлов
      if (!req.files || req.files.length === 0) {
        console.log('No files uploaded:', req.files);
        return res.status(400).json({ message: 'Изображения обязательны для создания объявления' });
      }

      // Обработка файлов
      const processedFiles = [];
      for (const file of req.files) {
        const outputFileName = 'processed-' + file.filename;
        const outputFilePath = path.join(uploadDir, outputFileName);
        await processImage(file.path, outputFilePath); // Обработка изображения
        processedFiles.push(`/uploads/${outputFileName}`);
      }

      // Сохранение объявления в базу данных
      const { title, description, categories, target_info } = req.body;
      const userId = req.user.id; // ID пользователя из middleware auth

      const result = await db.query(
        `INSERT INTO announcements (title, description, categories, target_info, image_url, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [title, description, categories, target_info, JSON.stringify(processedFiles), userId]
      );

      // Отправка ответа
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
  (req, res, next) => {
    req.body = { ...req.body };
    next();
  },
  body('title').optional().notEmpty().withMessage('Название не может быть пустым'),
  body('description').optional().notEmpty().withMessage('Описание не может быть пустым'),
  body('categories').optional().notEmpty().withMessage('Категории не могут быть пустыми'),
  body('target_info').optional().notEmpty().withMessage('Информация не может быть пустой'),
  async (req, res, next) => {
    try {
      const announcementId = req.params.id;
      const userId = req.user.id;
      
      const { rows } = await db.query('SELECT * FROM announcements WHERE id = $1 AND user_id = $2', [announcementId, userId]);
      if (rows.length === 0) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }
      
      const { title, description, categories, target_info } = req.body;
      
      let imageUrlsJson;
      if (req.files && req.files.length > 0) {
        const processedFiles = [];
        for (const file of req.files) {
          const outputFileName = 'processed-' + file.filename;
          const outputFilePath = path.join(uploadDir, outputFileName);
          await processImage(file.path, outputFilePath);
          processedFiles.push(`/uploads/${outputFileName}`);
        }
        imageUrlsJson = JSON.stringify(processedFiles);
      }
      
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
      next(err);
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
      
      const { rows } = await db.query('SELECT * FROM announcements WHERE id = $1 AND user_id = $2', [announcementId, userId]);
      if (rows.length === 0) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }
      
      await db.query('DELETE FROM announcements WHERE id = $1 AND user_id = $2', [announcementId, userId]);
      res.json({ message: 'Объявление успешно удалено' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;