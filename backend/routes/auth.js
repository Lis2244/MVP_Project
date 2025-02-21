const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Регистрация пользователя
router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('location').notEmpty().withMessage('Регион/город обязателен'),
  async (req, res, next) => {
    console.log('Запрос регистрации:', req.body);
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let { email, password, location } = req.body;
      location = location.trim().toLowerCase();

      const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'Пользователь с таким email уже зарегистрирован' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(
        'INSERT INTO users (email, password, location) VALUES ($1, $2, $3) RETURNING id, email, location',
        [email, hashedPassword, location]
      );
      
      const token = jwt.sign({ id: result.rows[0].id, email, location }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ user: result.rows[0], token });
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      next(err);
    }
  }
);

// Логин пользователя
router.post('/login',
  body('email').isEmail(),
  body('password').exists(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Неверные email или пароль' });
      }
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Неверные email или пароль' });
      }
      
      const token = jwt.sign({ id: user.id, email: user.email, location: user.location }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ user: { id: user.id, email: user.email, location: user.location }, token });
    } catch (err) {
      console.error('Ошибка логина:', err);
      next(err);
    }
  }
);

module.exports = router;