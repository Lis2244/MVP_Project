const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Сохраняем оригинальное имя с уникальным префиксом (очистите имя, если нужно)
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Настройка Multer: разрешаем файлы до 5 МБ и до 5 файлов
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    // Разрешаем загрузку любых файлов, но можно ограничить до изображений:
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Разрешены только изображения!'), false);
    } else {
      cb(null, true);
    }
  }
});

// Функция обработки изображений с помощью Sharp
async function processImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize({ width: 800 })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
}

module.exports = { upload, processImage, uploadDir };