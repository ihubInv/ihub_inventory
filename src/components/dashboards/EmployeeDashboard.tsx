import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import RequestStatus from '../requests/RequestStatus';
import CreateRequest from '../requests/CreateRequest';
import Profile from '../profile/Profile';
import NotificationCenter from '../notifications/NotificationCenter';
import DepreciationReport from '../reports/DepreciationReport';
import EmployeeIssuedItems from '../issued/EmployeeIssuedItems';

const EmployeeDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="/requests" element={<RequestStatus />} />
      <Route path="/create-request" element={<CreateRequest />} />
      <Route path="/issued-items" element={<EmployeeIssuedItems />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<NotificationCenter />} />
      <Route path="/reports" element={<DepreciationReport />} />
    </Routes>
  );
};

export default EmployeeDashboard;