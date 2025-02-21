import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function AnnouncementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: '',
    target_info: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await api.get(`/announcements/${id}`);
        setAnnouncement(response.data);
        setFormData({
          title: response.data.title,
          description: response.data.description,
          categories: response.data.categories,
          target_info: response.data.target_info
        });
      } catch (error) {
        console.error('Ошибка загрузки объявления:', error);
      }
    };
    fetchAnnouncement();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/announcements/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncement(response.data);
      setEditing(false);
      setMessage('Объявление обновлено');
    } catch (error) {
      console.error('Ошибка обновления объявления:', error);
      setMessage('Ошибка обновления объявления');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/profile');
    } catch (error) {
      console.error('Ошибка удаления объявления:', error);
      setMessage('Ошибка удаления объявления');
    }
  };

  if (!announcement) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {editing ? (
        <div>
          <h2 className="text-3xl font-bold mb-4">Редактировать объявление</h2>
          <input 
            type="text" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2 mb-4"
          />
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2 mb-4"
          />
          <input 
            type="text" 
            name="categories"
            value={formData.categories}
            onChange={handleChange}
            placeholder="Укажите категории (например, игрушки, книги)"
            className="w-full border rounded px-4 py-2 mb-4"
          />
          <input 
            type="text" 
            name="target_info"
            value={formData.target_info}
            onChange={handleChange}
            placeholder="Например, от 1 до 3 лет или размер одежды/обуви"
            className="w-full border rounded px-4 py-2 mb-4"
          />
          <button 
            onClick={handleUpdate}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Сохранить изменения
          </button>
          <button 
            onClick={() => setEditing(false)}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          >
            Отмена
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-3xl font-bold mb-4">{announcement.title}</h2>
          <p className="mb-2"><strong>Описание:</strong> {announcement.description}</p>
          <p className="mb-2"><strong>Категории:</strong> {announcement.categories}</p>
          <p className="mb-2"><strong>Целевая аудитория:</strong> {announcement.target_info}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-4">
            {JSON.parse(announcement.image_url).map((img, idx) => (
              <img key={idx} src={img} alt={`Объявление ${idx}`} className="w-full h-40 object-cover rounded" />
            ))}
          </div>
          <button 
            onClick={() => setEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Редактировать
          </button>
          <button 
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Удалить
          </button>
        </div>
      )}
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
}

export default AnnouncementDetails;