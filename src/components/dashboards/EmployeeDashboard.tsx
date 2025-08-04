import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmployeeDashboardHome from './EmployeeDashboardHome';
import RequestStatus from '../requests/RequestStatus';
import CreateRequest from '../requests/CreateRequest';
import Profile from '../profile/Profile';

const EmployeeDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<EmployeeDashboardHome />} />
      <Route path="/requests" element={<RequestStatus />} />
      <Route path="/create-request" element={<CreateRequest />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default EmployeeDashboard;