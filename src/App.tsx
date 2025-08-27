import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppStateProvider } from './contexts/AppStateContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import RegisterPage from './components/auth/RegisterPage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import StockManagerDashboard from './components/dashboards/StockManagerDashboard';
import EmployeeDashboard from './components/dashboards/EmployeeDashboard';

// ✅ Main content after context + router
const AppContent: React.FC = () => {
  const { isAuthenticated, user ,loading} = useAuth();


  if (loading) return <div className="p-10 text-xl text-center">Loading session...</div>;

  const ProtectedRoute: React.FC<{
    children: React.ReactNode;
    allowedRoles: string[];
  }> = ({ children, allowedRoles }) => {
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/unauthorized" element={<div className="p-8 text-center">Unauthorized Access</div>} />
      <Route path="*" element={<Navigate to="/login" replace />} />

      {/* Protected Routes with Layout */}
      <Route element={<Layout><Outlet /></Layout>}>
        <Route
          element={
            <ProtectedRoute allowedRoles={['admin', 'stock-manager', 'employee']}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          {/* Redirect to correct dashboard */}
          <Route path="/" element={<Navigate to={`/${user?.role}`} replace />} />

          {/* Role-Based Dashboards */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-manager/*"
            element={
              <ProtectedRoute allowedRoles={['stock-manager']}>
                <StockManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/*"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
};

// ✅ Application Entry
const App: React.FC = () => {
  return (
    <Router>
      <AppStateProvider>
        <AuthProvider>
          <InventoryProvider>
            <NotificationProvider>
              <AppContent />
              <Toaster />
            </NotificationProvider>
          </InventoryProvider>
        </AuthProvider>
      </AppStateProvider>
    </Router>
  );
};

export default App;
