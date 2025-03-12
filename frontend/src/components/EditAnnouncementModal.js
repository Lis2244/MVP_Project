import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Lightbox from 'yet-another-react-lightbox';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'yet-another-react-lightbox/styles.css'; // Импорт стилей Lightbox
import api from '../services/api';

function EditAnnouncementModal({ announcement, onClose, onSave }) {
  const [title, setTitle] = useState(announcement.title);
  const [description, setDescription] = useState(announcement.description);
  const [age, setAge] = useState(announcement.target_info);
  const [city, setCity] = useState(announcement.location);
  const [images, setImages] = useState(JSON.parse(announcement.image_url));
  const [isSaving, setIsSaving] = useState(false); // Флаг для предотвращения двойного вызова
  const [isLightboxOpen, setIsLightboxOpen] = useState(false); // Состояние для открытия Lightbox
  const [photoIndex, setPhotoIndex] = useState(0); // Индекс текущего изображения в Lightbox

  const handleSave = async () => {
    if (isSaving) return; // Если запрос уже выполняется, выходим
    setIsSaving(true); // Устанавливаем флаг, что запрос начался

    const updatedAnnouncement = {
      ...announcement,
      title,
      description,
      target_info: age,
      location: city,
      image_url: JSON.stringify(images),
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен отсутствует');
        setIsSaving(false); // Сбрасываем флаг в случае ошибки
        return;
      }

      const response = await api.put(
        `/announcements/${updatedAnnouncement.id}`,
        updatedAnnouncement,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Объявление успешно обновлено:', response.data);
      onSave(response.data); // Обновляем состояние в родительском компоненте
    } catch (error) {
      console.error('Ошибка при обновлении объявления:', error);
    } finally {
      setIsSaving(false); // Сбрасываем флаг после завершения запроса
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 overflow-y-auto max-h-screen">
        <h2 className="text-2xl font-bold mb-4">Редактировать объявление</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="Название"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="Описание"
        />
        <select
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
          <option value="12+">12+</option>
        </select>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="Город/населённый пункт"
        />

        {/* Слайдер с изображениями */}
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={50}
          slidesPerView={1}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                src={`http://localhost:5000${image}`}
                alt={`Изображение ${index + 1}`}
                className="w-full h-64 object-cover rounded cursor-pointer"
                onClick={() => {
                  setPhotoIndex(index);
                  setIsLightboxOpen(true);
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Lightbox для увеличения изображений */}
        {isLightboxOpen && (
          <Lightbox
            open={isLightboxOpen}
            close={() => setIsLightboxOpen(false)}
            slides={images.map((image) => ({ src: `http://localhost:5000${image}` }))}
            index={photoIndex}
          />
        )}

        {/* Кнопки для закрытия и сохранения */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Закрыть
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving} // Блокируем кнопку, если запрос выполняется
            className={`bg-blue-500 text-white px-4 py-2 rounded ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditAnnouncementModal;