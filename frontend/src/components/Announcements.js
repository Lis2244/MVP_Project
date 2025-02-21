import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get(`/api/announcements?search=${search}`);
      setAnnouncements(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Объявления</h2>
        <div className="mb-6">
          <input 
            type="text"
            placeholder="Поиск по названию"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {announcements.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
              <img src={JSON.parse(item.image_url)[0]} alt={item.title} className="w-full h-40 object-cover rounded mb-2" />
              <p className="text-sm text-gray-600">От: {item.email}</p>
              <a href={`/announcements/${item.id}`} className="text-blue-500 hover:underline">Подробнее</a>
            </div>
          ))}
        </div>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
}

export default Announcements;