import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!profile) return <div className="p-4">{message || 'Загрузка профиля...'}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">Профиль</h2>
      <p className="mb-4"><strong>Email:</strong> {profile.user.email}</p>
      <p className="mb-4"><strong>Регион/город:</strong> {profile.user.location}</p>
      <h3 className="text-2xl font-semibold mb-4">Ваши объявления</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profile.announcements.map(ann => (
          <div key={ann.id} className="bg-white border rounded p-4 shadow">
            <h4 className="text-xl font-bold mb-2">{ann.title}</h4>
            <img src={JSON.parse(ann.image_url)[0]} alt={ann.title} className="w-full h-32 object-cover rounded mb-2" />
            <a href={`/announcements/${ann.id}`} className="text-blue-500 hover:underline">Подробнее</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;