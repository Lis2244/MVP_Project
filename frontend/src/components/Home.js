import React from 'react';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Добро пожаловать на платформу обмена детскими вещами
        </h1>
        <p className="text-xl text-gray-600">
          Найдите нужные вещи или предложите свои для обмена!
        </p>
      </div>
    </div>
  );
}

export default Home;