import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const AnnouncementDetails = ({ announcement, onClose }) => {
  const images = JSON.parse(announcement.image_url);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 overflow-y-auto max-h-screen">
        <h2 className="text-2xl font-bold mb-4">{announcement.title}</h2>
        <p className="text-gray-600 mb-4">{announcement.description}</p>
        <p className="text-gray-500 mb-2">Категория: {announcement.categories}</p>
        <p className="text-gray-500 mb-2">Возраст: {announcement.target_info}</p>
        <p className="text-gray-500 mb-4">Город: {announcement.location}</p>

        {/* Слайдер с изображениями */}
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={50}
          slidesPerView={1}
          className="w-full h-96"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                src={`http://localhost:5000${image}`}
                alt={`Изображение ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default AnnouncementDetails;