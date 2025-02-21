import React, { useState } from 'react';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await api.post(endpoint, { email, password, location });
      localStorage.setItem('token', response.data.token);
      setMessage('Успешная авторизация!');
    } catch (error) {
      console.error(error);
      setMessage('Ошибка: ' + (error.response?.data?.message || 'Что-то пошло не так'));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">
        {isRegister ? 'Регистрация' : 'Логин'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Пароль:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            className="w-full border p-2 rounded"
          />
        </div>
        {isRegister && (
          <div>
            <label className="block mb-1">Регион/город:</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required 
              className="w-full border p-2 rounded"
            />
          </div>
        )}
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">
          {isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>
      <button 
        onClick={() => setIsRegister(!isRegister)}
        className="mt-4 text-blue-500 underline block text-center"
      >
        {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
}

export default Login;