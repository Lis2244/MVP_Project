import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Lightbox from 'yet-another-react-lightbox';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'yet-another-react-lightbox/styles.css';
import api from '../services/api';

function EditAnnouncementModal({ announcement, onClose, onSave }) {
  const [title, setTitle] = useState(announcement.title);
  const [description, setDescription] = useState(announcement.description);
  const [age, setAge] = useState(announcement.target_info);
  const [city, setCity] = useState(announcement.location);
  const [images, setImages] = useState(JSON.parse(announcement.image_url));
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const handleDeleteImage = (imagePath) => {
    setImages(images.filter(image => image !== imagePath));
    setImagesToDelete([...imagesToDelete, imagePath]);
  };

  const handleAddImages = (e) => {
    const files = e.target.files;
    if (files.length + images.length > 5) {
      alert('Максимальное количество изображений — 5');
      return;
    }
    setNewImages([...newImages, ...files]);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('target_info', age);
    formData.append('location', city);
    formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    newImages.forEach(image => formData.append('images', image));

    console.log('Данные для обновления:', {
      title,
      description,
      age,
      city,
      imagesToDelete,
      newImages,
    });

    try {
      const token = localStorage.getItem('token');
      const response = await api.put(
        `/announcements/${announcement.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Объявление успешно обновлено:', response.data);
      onSave(response.data);
    } catch (error) {
      console.error('Ошибка при обновлении объявления:', error);
    } finally {
      setIsSaving(false);
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
              <button
                onClick={() => handleDeleteImage(image)}
                className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
              >
                Удалить
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        {isLightboxOpen && (
          <Lightbox
            open={isLightboxOpen}
            close={() => setIsLightboxOpen(false)}
            slides={images.map((image) => ({ src: `http://localhost:5000${image}` }))}
            index={photoIndex}
          />
        )}
        <input
          type="file"
          multiple
          onChange={handleAddImages}
          disabled={images.length + newImages.length >= 5}
          className="w-full border p-2 rounded mb-4"
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Закрыть
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
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