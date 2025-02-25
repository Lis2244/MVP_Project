import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState('');

  // Функция для получения данных профиля
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error(error);
      setMessage('Ошибка при получении профиля');
    }
  };

  // Загрузка данных профиля при монтировании компонента
  useEffect(() => {
    fetchProfile();
  }, []);

  // Обработчик клика по кнопке "Редактировать"
  const handleEditClick = (announcement) => {
    setEditingId(announcement.id);
    setEditData({
      title: announcement.title,
      description: announcement.description,
      categories: announcement.categories,
      target_info: announcement.target_info
    });
  };

  // Обработчик изменения полей формы редактирования
  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Обработчик сохранения изменений
  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/announcements/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile((prevProfile) => ({
        ...prevProfile,
        announcements: prevProfile.announcements.map((ann) =>
          ann.id === id ? response.data : ann
        )
      }));
      setEditingId(null);
      setMessage('Объявление обновлено');
    } catch (error) {
      console.error(error);
      setMessage('Ошибка обновления объявления');
    }
  };

  // Обработчик отмены редактирования
  const handleCancel = () => {
    setEditingId(null);
  };

  // Обработчик удаления объявления
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile((prevProfile) => ({
        ...prevProfile,
        announcements: prevProfile.announcements.filter((ann) => ann.id !== id)
      }));
      setMessage('Объявление удалено');
    } catch (error) {
      console.error(error);
      setMessage('Ошибка удаления объявления');
    }
  };

  // Если данные профиля ещё не загружены, показываем сообщение
  if (!profile) {
    return <div className="p-4">{message || 'Загрузка профиля...'}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">Профиль</h2>
      <p className="mb-4"><strong>Email:</strong> {profile.user.email}</p>
      <p className="mb-4"><strong>Регион/город:</strong> {profile.user.location}</p>
      <h3 className="text-2xl font-semibold mb-4">Ваши объявления</h3>
      <div className="space-y-4">
        {profile.announcements.map((ann) => {
          // Формируем URL изображения
          let imageUrl;
          try {
            imageUrl = `http://localhost:5000${JSON.parse(ann.image_url)[0]}`;
          } catch (error) {
            console.error('Ошибка при парсинге image_url:', ann.image_url, error);
            imageUrl = ''; // Используем пустую строку, если что-то пошло не так
          }

          return (
            <div key={ann.id} className="bg-white border rounded p-4 shadow">
              {editingId === ann.id ? (
                // Форма редактирования
                <>
                  <input
                    type="text"
                    name="title"
                    value={editData.title}
                    onChange={handleInputChange}
                    className="w-full border rounded px-4 py-2 mb-2"
                  />
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleInputChange}
                    className="w-full border rounded px-4 py-2 mb-2"
                  />
                  <input
                    type="text"
                    name="categories"
                    value={editData.categories}
                    onChange={handleInputChange}
                    className="w-full border rounded px-4 py-2 mb-2"
                  />
                  <input
                    type="text"
                    name="target_info"
                    value={editData.target_info}
                    onChange={handleInputChange}
                    className="w-full border rounded px-4 py-2 mb-2"
                  />
                  <button
                    onClick={() => handleSave(ann.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 text-black px-4 py-2 rounded"
                  >
                    Отмена
                  </button>
                </>
              ) : (
                // Отображение объявления
                <>
                  <h4 className="text-xl font-bold mb-2">{ann.title}</h4>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={ann.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <p className="mb-2"><strong>Описание:</strong> {ann.description}</p>
                  <p className="mb-2"><strong>Категории:</strong> {ann.categories}</p>
                  <p className="mb-2"><strong>Целевая аудитория:</strong> {ann.target_info}</p>
                  <button
                    onClick={() => handleEditClick(ann)}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Удалить
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
      {message && (
        <p className="mt-4 text-center text-red-500">{message}</p>
      )}
    </div>
  );
}

export default Profile;