import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react'; // Импортируем Swiper
import { Navigation, Pagination } from 'swiper/modules'; // Импортируем модули Swiper
import 'swiper/css'; // Базовые стили Swiper
import 'swiper/css/navigation'; // Стили для навигации
import 'swiper/css/pagination'; // Стили для пагинации
import api from '../services/api';
import CreateAnnouncement from './CreateAnnouncement';

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null); // Состояние для выбранного объявления

  // Функция для получения списка объявлений
  const fetchAnnouncements = async () => {
    try {
      const response = await api.get(`/announcements?search=${search}`);
      setAnnouncements(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Загрузка объявлений при изменении поискового запроса
  useEffect(() => {
    fetchAnnouncements();
  }, [search]);

  // Обработчик клика по объявлению
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setSelectedAnnouncement(null);
  };

  // Обработчик создания нового объявления
  const handleNewAnnouncement = (newAnnouncement) => {
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Объявления</h2>
        
        {/* Кнопка для показа/скрытия формы создания объявления */}
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

        {/* Форма создания объявления */}
        {showCreateForm && (
          <CreateAnnouncement onCreated={handleNewAnnouncement} />
        )}

        {/* Поиск по объявлениям */}
        <div className="mb-6">
          <input 
            type="text"
            placeholder="Поиск по названию"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {/* Список объявлений */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {announcements.map(item => {
            let imageUrl;
            try {
              imageUrl = `http://localhost:5000${JSON.parse(item.image_url)[0]}`;
            } catch (error) {
              console.error('Ошибка при парсинге image_url:', item.image_url, error);
              imageUrl = ''; // Используем пустую строку, если что-то пошло не так
            }

            return (
              <div
                key={item.id}
                onClick={() => handleAnnouncementClick(item)} // Обработчик клика по объявлению
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                {imageUrl && (
                  <img src={imageUrl} alt={item.title} className="w-full h-40 object-cover rounded mb-2" />
                )}
                <p className="text-sm text-gray-600">От: {item.email}</p>
              </div>
            );
          })}
        </div>

        {/* Модальное окно с деталями объявления */}
        {selectedAnnouncement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 overflow-y-auto max-h-screen">
              <h2 className="text-2xl font-bold mb-4">{selectedAnnouncement.title}</h2>

              {/* Слайдер для изображений */}
              <Swiper
                modules={[Navigation, Pagination]} // Подключаем модули
                navigation // Включаем навигацию (стрелки)
                pagination={{ clickable: true }} // Включаем пагинацию (точки)
                spaceBetween={50} // Расстояние между слайдами
                slidesPerView={1} // Количество слайдов на экране
              >
                {JSON.parse(selectedAnnouncement.image_url).map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={`http://localhost:5000${image}`}
                      alt={`Изображение ${index + 1}`}
                      className="w-full h-64 object-cover rounded"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Детали объявления */}
              <p className="mt-4"><strong>Описание:</strong> {selectedAnnouncement.description}</p>
              <p className="mt-2"><strong>Категории:</strong> {selectedAnnouncement.categories}</p>
              <p className="mt-2"><strong>Целевая аудитория:</strong> {selectedAnnouncement.target_info}</p>

              {/* Кнопка закрытия */}
              <button
                onClick={handleCloseModal}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        {/* Сообщения об ошибках */}
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
}

export default Announcements;