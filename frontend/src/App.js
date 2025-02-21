import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Announcements from './components/Announcements';
import Profile from './components/Profile';
import AnnouncementDetails from './components/AnnouncementDetails';

function App() {
  return (
    <div>
      <nav className="bg-gray-800 p-4 text-white">
        <Link className="mr-4" to="/">Главная</Link>
        <Link className="mr-4" to="/login">Авторизация</Link>
        <Link className="mr-4" to="/announcements">Объявления</Link>
        <Link to="/profile">Профиль</Link>
      </nav>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/announcements/:id" element={<AnnouncementDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;