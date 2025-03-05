import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import EditAnnouncementModal from './EditAnnouncementModal';

function MyAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchMyAnnouncements();
  }, []);

  const fetchMyAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/announcements/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Ошибка при получении объявлений:', error);
    }
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      fetchMyAnnouncements();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (updatedAnnouncement) => {
    try {
      await api.put(`/announcements/${updatedAnnouncement.id}`, updatedAnnouncement);
      fetchMyAnnouncements();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Мои объявления</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {announcements.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
              {item.image_url && (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  spaceBetween={50}
                  slidesPerView={1}
                >
                  {JSON.parse(item.image_url).map((image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={`http://localhost:5000${image}`}
                        alt={`Изображение ${index + 1}`}
                        className="w-full h-64 object-cover rounded"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
              <p className="text-sm text-gray-600">{item.description}</p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
        {isEditing && (
          <EditAnnouncementModal
            announcement={selectedAnnouncement}
            onClose={() => setIsEditing(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}

export default MyAnnouncements;