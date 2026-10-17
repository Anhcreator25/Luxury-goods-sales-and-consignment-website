import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages imported cleanly from domain folders via index.js
import {
  HomePage,
  ShopPage,
  ProductDetailPage,
  LoginPage,
  RegisterPage,
  CartPage,
  MyOrdersPage,
  MyProductsPage,
  IncomingOrdersPage,
  ProfilePage,
  AdminDashboard,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />

        {/* ── Auth Routes ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── User Dashboard Routes ── */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/my-products" element={<MyProductsPage />} />
        <Route path="/incoming-orders" element={<IncomingOrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* ── Admin Routes ── */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;