import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaPlus, FaTrash, FaUser, FaChild, FaVenusMars, FaBirthdayCake } from 'react-icons/fa'; // Иконки

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editingChildren, setEditingChildren] = useState(false);
  const [children, setChildren] = useState([]);
  const [newChild, setNewChild] = useState({ name: '', age: '', gender: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Функция для получения данных профиля
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setChildren(response.data.user.children || []);
    } catch (error) {
      console.error(error);
      setMessage('Ошибка при получении профиля');
    }
  };

  // Загрузка данных профиля при монтировании компонента
  useEffect(() => {
    fetchProfile();
  }, []);

  // Обработчик добавления нового ребенка
  const handleAddChild = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedChildren = [...children, newChild];
      const response = await api.put(
        '/users/me',
        { children: updatedChildren },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChildren(updatedChildren);
      setNewChild({ name: '', age: '', gender: '' });
      setEditingChildren(false);
      setMessage('Ребенок успешно добавлен');
    } catch (error) {
      console.error(error);
      setMessage('Ошибка при добавлении ребенка');
    }
  };

  const handleDeleteProfile = async () => {
    if (window.confirm('Вы уверены, что хотите удалить профиль? Это действие нельзя отменить.')) {
      try {
        const token = localStorage.getItem('token');
        await api.delete('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.removeItem('token');
        navigate('/login');
      } catch (error) {
        console.error(error);
        setMessage('Ошибка при удалении профиля');
      }
    }
  };

  const handleDeleteChild = async (index) => {
    try {
      const token = localStorage.getItem('token');
      const updatedChildren = children.filter((_, i) => i !== index);
      const response = await api.put(
        '/users/me',
        { children: updatedChildren },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChildren(updatedChildren);
      setMessage('Ребенок успешно удален');
    } catch (error) {
      console.error(error);
      setMessage('Ошибка при удалении ребенка');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Профиль</h2>
        <button
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center"
        >
          <FaUser className="mr-2" /> Выйти
        </button>
      </div>

      {/* Информация о пользователе */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <p className="text-gray-700 mb-2">
          <strong>Email:</strong> {profile?.user.email}
        </p>
        <p className="text-gray-700">
          <strong>Регион/город:</strong> {profile?.user.location}
        </p>
      </div>

      {/* Список детей */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Ваши дети</h3>
      <div className="space-y-4">
        {children.map((child, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <p className="text-gray-700">
                <strong>Имя:</strong> {child.name}
              </p>
              <p className="text-gray-700">
                <strong>Возраст:</strong> {child.age}
              </p>
              <p className="text-gray-700">
                <strong>Пол:</strong> {child.gender}
              </p>
            </div>
            <button
              onClick={() => handleDeleteChild(index)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center"
            >
              <FaTrash className="mr-1" /> Удалить
            </button>
          </div>
        ))}
      </div>

      {/* Кнопка добавления ребенка */}
      <button
        onClick={() => setEditingChildren(!editingChildren)}
        className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all w-full flex items-center justify-center"
      >
        <FaPlus className="mr-2" /> {editingChildren ? 'Скрыть форму' : 'Добавить ребенка'}
      </button>

      {/* Форма добавления ребенка */}
      {editingChildren && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-xl font-bold text-gray-800 mb-4">Добавить ребенка</h4>
          <div className="space-y-4">
            <div className="flex items-center border rounded-lg p-2">
              <FaChild className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Имя"
                value={newChild.name}
                onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                className="w-full outline-none"
              />
            </div>
            <div className="flex items-center border rounded-lg p-2">
              <FaBirthdayCake className="text-gray-500 mr-2" />
              <select
                value={newChild.age}
                onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                className="w-full outline-none"
              >
                <option value="">Выберите возраст</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
                <option value="12+">12+</option>
              </select>
            </div>
            <div className="flex items-center border rounded-lg p-2">
              <FaVenusMars className="text-gray-500 mr-2" />
              <select
                value={newChild.gender}
                onChange={(e) => setNewChild({ ...newChild, gender: e.target.value })}
                className="w-full outline-none"
              >
                <option value="">Выберите пол</option>
                <option value="Мальчик">Мальчик</option>
                <option value="Девочка">Девочка</option>
              </select>
            </div>
            <button
              onClick={handleAddChild}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all w-full flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Добавить
            </button>
          </div>
        </div>
      )}

      {/* Кнопка удаления профиля */}
      <button
        onClick={handleDeleteProfile}
        className="mt-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all w-full flex items-center justify-center"
      >
        <FaTrash className="mr-2" /> Удалить профиль
      </button>

      {/* Сообщения об ошибках или успехе */}
      {message && (
        <div className="mt-6 text-center">
          <p className="text-red-500">{message}</p>
        </div>
      )}
    </div>
  );
}

export default Profile;
