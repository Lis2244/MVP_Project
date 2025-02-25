import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CreateAnnouncement from './CreateAnnouncement';

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get(`/announcements?search=${search}`);
      console.log('Данные от сервера:', response.data); // Логируем данные
      setAnnouncements(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [search]);

  const handleNewAnnouncement = (newAnnouncement) => {
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Объявления</h2>
        
        {localStorage.getItem('token') && (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              {showCreateForm ? 'Скрыть форму' : 'Добавить объявление'}
            </button>
          </div>
        )}

        {showCreateForm && (
          <CreateAnnouncement onCreated={handleNewAnnouncement} />
        )}

        <div className="mb-6">
          <input 
            type="text"
            placeholder="Поиск по названию"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {announcements.map(item => {
            let imageUrl;
            try {
              imageUrl = `http://localhost:5000${JSON.parse(item.image_url)[0]}`;
            } catch (error) {
              console.error('Ошибка при парсинге image_url:', item.image_url, error);
              imageUrl = ''; // или используйте заглушку для изображения
            }

            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                {imageUrl && (
                  <img src={imageUrl} alt={item.title} className="w-full h-40 object-cover rounded mb-2" />
                )}
                <p className="text-sm text-gray-600">От: {item.email}</p>
              </div>
            );
          })}
        </div>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
}

export default Announcements;