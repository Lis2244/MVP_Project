import React, { useState } from 'react';
import api from '../services/api';
import CreateAnnouncement from './CreateAnnouncement';
import AnnouncementDetails from './AnnouncementDetails'; // Импортируем новый компонент

const MyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null); // Состояние для выбранного объявления

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен отсутствует');
        return;
      }

      const response = await api.get('/announcements/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке объявлений:', error);
    }
  };

  React.useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAnnouncementCreated = (newAnnouncement) => {
    setAnnouncements([...announcements, newAnnouncement]);
    setShowCreateForm(false);
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="text-2xl font-bold mb-4">Мои объявления</h2>

      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {showCreateForm ? 'Скрыть форму' : 'Создать новое объявление'}
      </button>

      {showCreateForm && (
        <CreateAnnouncement onCreated={handleAnnouncementCreated} />
      )}

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="border p-4 rounded cursor-pointer"
            onClick={() => setSelectedAnnouncement(announcement)} // Открываем детали объявления
          >
            <h3 className="text-xl font-semibold">{announcement.title}</h3>
            <p className="text-gray-600">{announcement.description}</p>
            <p className="text-gray-500">Категория: {announcement.categories}</p>
            <p className="text-gray-500">Возраст: {announcement.target_info}</p>
            <p className="text-gray-500">Город: {announcement.location}</p>
          </div>
        ))}
      </div>

      {/* Отображение деталей объявления */}
      {selectedAnnouncement && (
        <AnnouncementDetails
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)} // Закрываем детали объявления
        />
      )}
    </div>
  );
};

export default MyAnnouncements;