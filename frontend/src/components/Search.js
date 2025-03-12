import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Search() {
  const [announcements, setAnnouncements] = useState([]);
  const [ageFilter, setAgeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Загрузка объявлений с фильтрами
  const loadAnnouncements = async () => {
    try {
      const response = await api.get('/api/announcements', {
        params: {
          age: ageFilter,
          city: cityFilter,
        },
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке объявлений:', error);
    }
  };

  // Загружаем объявления при изменении фильтров
  useEffect(() => {
    loadAnnouncements();
  }, [ageFilter, cityFilter]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Поиск объявлений</h1>

      {/* Фильтры */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Возраст"
          value={ageFilter}
          onChange={(e) => setAgeFilter(e.target.value)}
          className="border p-2 rounded mr-2"
        />
        <input
          type="text"
          placeholder="Город/населённый пункт"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Список объявлений */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold">{announcement.title}</h2>
            <p className="text-gray-600">{announcement.description}</p>
            <p className="text-sm text-gray-500">
              Возраст: {announcement.target_info}, Город: {announcement.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;