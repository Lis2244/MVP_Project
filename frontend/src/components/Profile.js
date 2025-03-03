import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Профиль</h2>
        <button
          onClick={() => navigate('/login')}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Выйти
        </button>
      </div>
      <p className="mb-4"><strong>Email:</strong> {profile?.user.email}</p>
      <p className="mb-4"><strong>Регион/город:</strong> {profile?.user.location}</p>

      <h3 className="text-2xl font-semibold mb-4">Ваши дети</h3>
      <div className="space-y-4">
        {children.map((child, index) => (
          <div key={index} className="bg-white border rounded p-4 shadow">
            <p><strong>Имя:</strong> {child.name}</p>
            <p><strong>Возраст:</strong> {child.age}</p>
            <p><strong>Пол:</strong> {child.gender}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setEditingChildren(!editingChildren)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {editingChildren ? 'Скрыть форму' : 'Добавить ребенка'}
      </button>

      {editingChildren && (
        <div className="mt-4 bg-white border rounded p-4 shadow">
          <h4 className="text-xl font-bold mb-4">Добавить ребенка</h4>
          <input
            type="text"
            placeholder="Имя"
            value={newChild.name}
            onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
            className="w-full border p-2 rounded mb-2"
          />
          <input
            type="text"
            placeholder="Возраст"
            value={newChild.age}
            onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
            className="w-full border p-2 rounded mb-2"
          />
          <input
            type="text"
            placeholder="Пол"
            value={newChild.gender}
            onChange={(e) => setNewChild({ ...newChild, gender: e.target.value })}
            className="w-full border p-2 rounded mb-2"
          />
          <button
            onClick={handleAddChild}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Добавить
          </button>
        </div>
      )}

      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
}

export default Profile;