import React, { useState } from 'react';
import api from '../services/api';
import AsyncSelect from 'react-select/async'; // Импортируем асинхронный Select
import Select from 'react-select'; // Для других выпадающих списков

const CreateAnnouncement = ({ onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [targetInfo, setTargetInfo] = useState('');
  const [location, setLocation] = useState(null); // Для react-select
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Функция для асинхронной загрузки городов
  const loadCities = async (inputValue) => {
    try {
      const response = await api.get(`/cities?search=${inputValue}`);
      return response.data.map((city) => ({
        value: city,
        label: city,
      }));
    } catch (error) {
      console.error('Ошибка при загрузке городов:', error);
      return [];
    }
  };

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
      <Select
        options={[
          { value: 'Одежда', label: 'Одежда' },
          { value: 'Игрушки', label: 'Игрушки' },
          { value: 'Коляски', label: 'Коляски' },
          { value: 'Книги', label: 'Книги' },
          { value: 'Мебель', label: 'Мебель' },
          { value: 'Обувь', label: 'Обувь' },
          { value: 'Аксессуары', label: 'Аксессуары' },
        ]}
        value={{ value: categories, label: categories }}
        onChange={(selectedOption) => setCategories(selectedOption.value)}
        placeholder="Выберите категорию"
        className="w-full"
        isSearchable
      />

      {/* Выпадающий список для возраста */}
      <Select
        options={Array.from({ length: 13 }, (_, i) => ({
          value: i === 12 ? '12+' : i,
          label: i === 12 ? '12+' : i,
        }))}
        value={{ value: targetInfo, label: targetInfo }}
        onChange={(selectedOption) => setTargetInfo(selectedOption.value)}
        placeholder="Выберите возраст"
        className="w-full"
        isSearchable
      />

      {/* Асинхронный Select для городов */}
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadCities}
        value={location}
        onChange={(selectedOption) => setLocation(selectedOption)}
        placeholder="Выберите город/населённый пункт"
        className="w-full"
        isSearchable
        noOptionsMessage={() => 'Город не найден'}
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