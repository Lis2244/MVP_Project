import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AnnouncementDetails from './AnnouncementDetails';
import EditAnnouncementModal from './EditAnnouncementModal';

const MyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Загрузка объявлений текущего пользователя
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('token');
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

    fetchAnnouncements();
  }, []);

  // Загрузка данных текущего пользователя
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Удаление объявления
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/announcements/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAnnouncements(announcements.filter(announcement => announcement.id !== id));
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Ошибка при удалении объявления:', error);
    }
  };

  // Редактирование объявления
  const handleEdit = (id) => {
    console.log('Редактирование объявления с ID:', id);
    const announcementToEdit = announcements.find(announcement => announcement.id === id);
    setSelectedAnnouncement(announcementToEdit);
    setIsEditing(true); // Открываем модальное окно редактирования
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Мои объявления</h1>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="border p-4 rounded-lg cursor-pointer"
            onClick={() => setSelectedAnnouncement(announcement)}
          >
            <h2 className="text-xl font-semibold">{announcement.title}</h2>
            <p className="text-gray-600">{announcement.description}</p>
            <p className="text-gray-500">Категория: {announcement.categories}</p>
            <p className="text-gray-500">Возраст: {announcement.target_info}</p>
            <p className="text-gray-500">Город: {announcement.location}</p>
          </div>
        ))}
      </div>

      {/* Модальное окно с деталями объявления */}
      {selectedAnnouncement && (
        <AnnouncementDetails
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          onDelete={() => handleDelete(selectedAnnouncement.id)}
          onEdit={() => handleEdit(selectedAnnouncement.id)}
          isOwner={selectedAnnouncement.user_id === currentUser?.user?.id}
        />
      )}

      {/* Модальное окно редактирования */}
      {isEditing && selectedAnnouncement && (
        <EditAnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setIsEditing(false)}
          onSave={(updatedAnnouncement) => {
            setAnnouncements(announcements.map(announcement =>
              announcement.id === updatedAnnouncement.id ? updatedAnnouncement : announcement
            ));
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
};

export default MyAnnouncements;