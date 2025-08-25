import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmployeeDashboardHome from './EmployeeDashboardHome';
import RequestStatus from '../requests/RequestStatus';
import CreateRequest from '../requests/CreateRequest';
import Profile from '../profile/Profile';
import NotificationCenter from '../notifications/NotificationCenter';

const EmployeeDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<EmployeeDashboardHome />} />
      <Route path="/requests" element={<RequestStatus />} />
      <Route path="/create-request" element={<CreateRequest />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<NotificationCenter />} />
    </Routes>
  );
};

export default EmployeeDashboard;