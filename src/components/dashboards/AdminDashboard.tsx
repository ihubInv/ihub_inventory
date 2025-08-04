import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import InventoryList from '../inventory/InventoryList';
import AddInventory from '../inventory/AddInventory';
import UserManagement from '../users/UserManagement';
import NotificationCenter from '../notifications/NotificationCenter';
import Profile from '../profile/Profile';
import CategoryManagement from '../categories/CategoryManagement';

const AdminDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="/inventory" element={<InventoryList />} />
      <Route path="/add-inventory" element={<AddInventory />} />
      <Route path="/add-category" element={<CategoryManagement />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/notifications" element={<NotificationCenter />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default AdminDashboard;