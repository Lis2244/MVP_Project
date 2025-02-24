import React, { useState } from 'react';
import api from '../services/api';

const CreateAnnouncement = ({ onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Обувь'); // значение по умолчанию
  const [targetInfo, setTargetInfo] = useState('');
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Вы должны быть авторизованы для создания объявления.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categories', category);
    formData.append('target_info', targetInfo);
    // Добавляем файлы. Обратите внимание: ключ должен быть "images"
    for (let i = 0; i < images.length && i < 5; i++) {
      formData.append('images', images[i]);
    }

    try {
      const response = await api.post('/announcements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('Объявление успешно создано.');
      // Очищаем форму
      setTitle('');
      setDescription('');
      setCategory('Обувь');
      setTargetInfo('');
      setImages([]);
      // Если передан callback, уведомляем родительский компонент о новом объявлении
      if (onCreated) {
        onCreated(response.data);
      }
    } catch (error) {
      console.error(error);
      setMessage('Ошибка создания объявления: ' + (error.response?.data?.message || 'Что-то пошло не так'));
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-2xl font-semibold mb-4">Создать объявление</h3>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block mb-1">Название</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Категория</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border p-2 rounded"
          >
            <option value="Обувь">Обувь</option>
            <option value="Игрушки">Игрушки</option>
            <option value="Одежда">Одежда</option>
            <option value="Велосипеды">Велосипеды</option>
            <option value="Самокаты">Самокаты</option>
            <option value="Коляски">Коляски</option>
            <option value="Санки">Санки</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Возраст малышей</label>
          <input
            type="text"
            value={targetInfo}
            onChange={(e) => setTargetInfo(e.target.value)}
            required
            className="w-full border p-2 rounded"
            placeholder="Например, 0-3 года"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Фотографии (до 5)</label>
          <input
            type="file"
            name="images"
            onChange={handleFileChange}
            multiple
            accept="image/*"
            required
            className="w-full"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Создать объявление
        </button>
      </form>
    </div>
  );
};

export default CreateAnnouncement;