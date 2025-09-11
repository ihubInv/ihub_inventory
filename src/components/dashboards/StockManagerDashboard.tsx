import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import InventoryList from '../inventory/InventoryList';
import AddInventory from '../inventory/AddInventory';
import UserManagement from '../users/UserManagement';
import NotificationCenter from '../notifications/NotificationCenter';
import Profile from '../profile/Profile';
import CategoryManagement from '../categories/CategoryManagement';
import LocationManagement from '../location/LocationManagement';
import DepreciationReport from '../reports/DepreciationReport';
import RequestStatus from '../requests/RequestStatus';

const StockManagerDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="/inventory" element={<InventoryList />} />
      <Route path="/add-inventory" element={<AddInventory />} />
      <Route path="/add-category" element={<CategoryManagement />} />
      <Route path="/location" element={<LocationManagement />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/notifications" element={<NotificationCenter />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/depreciation-report" element={<DepreciationReport />} />
      <Route path="/requests" element={<RequestStatus />} />
      <Route path="/reports" element={<DepreciationReport />} />
    </Routes>
  );
};

export default StockManagerDashboard;