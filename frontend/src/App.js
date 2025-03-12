import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Search from './components/Search';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import MyAnnouncements from './components/MyAnnouncements';

function App() {
  return (
    <div>
      <nav className="bg-gray-800 p-4 text-white">
        <Link className="mr-4" to="/">Главная</Link>
        <Link className="mr-4" to="/login">Авторизация</Link>
        <Link className="mr-4" to="/search">Поиск</Link>
        <Link className="mr-4" to="/my-announcements">Мои объявления</Link>
        <Link to="/profile">Профиль</Link>
      </nav>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/my-announcements"
            element={
              <ProtectedRoute>
                <MyAnnouncements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;