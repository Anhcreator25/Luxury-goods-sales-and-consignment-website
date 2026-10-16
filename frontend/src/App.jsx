import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import HomePage from './pages/homePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn tới trang Chủ */}
        <Route path="/" element={<HomePage />} />

        {/* Đường dẫn tới trang Đăng nhập */}
        <Route path="/login" element={<LoginPage />} />

        {/* Đường dẫn tới trang Đăng ký */}
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;