import React, { useState } from 'react';
import api from '../services/api';
import Select from 'react-select'; // Импортируем react-select
import { cities } from './cities'; // Импортируем список городов

const CreateAnnouncement = ({ onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [targetInfo, setTargetInfo] = useState('');
  const [location, setLocation] = useState(null); // Используем null для react-select
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categories', categories);
    formData.append('target_info', targetInfo);
    formData.append('location', location.value); // Используем location.value
    images.forEach((image) => formData.append('images', image));

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/announcements', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      onCreated(response.data); // Вызываем колбэк после успешного создания
    } catch (error) {
      console.error('Ошибка при создании объявления:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название"
        className="w-full border p-2 rounded"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание"
        className="w-full border p-2 rounded"
        required
      />

      {/* Выпадающий список для категорий */}
      <select
        value={categories}
        onChange={(e) => setCategories(e.target.value)}
        className="w-full border p-2 rounded"
        required
      >
        <option value="">Выберите категорию</option>
        <option value="Одежда">Одежда</option>
        <option value="Игрушки">Игрушки</option>
        <option value="Коляски">Коляски</option>
        <option value="Книги">Книги</option>
        <option value="Мебель">Мебель</option>
        <option value="Обувь">Обувь</option>
        <option value="Аксессуары">Аксессуары</option>
      </select>

      {/* Выпадающий список для возраста */}
      <select
        value={targetInfo}
        onChange={(e) => setTargetInfo(e.target.value)}
        className="w-full border p-2 rounded"
        required
      >
        <option value="">Выберите возраст</option>
        {Array.from({ length: 13 }, (_, i) => (
          <option key={i} value={i}>
            {i === 12 ? '12+' : i}
          </option>
        ))}
      </select>

      {/* Автодополнение для города */}
      <Select
        options={cities}
        value={location}
        onChange={(selectedOption) => setLocation(selectedOption)}
        placeholder="Выберите город/населённый пункт"
        className="w-full"
        isSearchable // Включаем поиск
        noOptionsMessage={() => 'Город не найден'} // Сообщение, если город не найден
      />

      <input
        type="file"
        multiple
        onChange={(e) => setImages([...e.target.files])}
        className="w-full border p-2 rounded"
        required
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isLoading ? 'Создание...' : 'Создать объявление'}
      </button>
    </form>
  );
};

export default CreateAnnouncement;