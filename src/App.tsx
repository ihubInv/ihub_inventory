import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from './store';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { initializeAuth } from './store/slices/authSlice';
import SessionManager from './utils/sessionManager';
import './utils/sessionTestUtils'; // Import for development utilities
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import RegisterPage from './components/auth/RegisterPage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import StockManagerDashboard from './components/dashboards/StockManagerDashboard';
import EmployeeDashboard from './components/dashboards/EmployeeDashboard';
import AttractiveLoader from './components/common/AttractiveLoader';

// ✅ Main content after Redux store
const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  // Initialize auth on component mount
  React.useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Initialize session manager and check for existing session
  React.useEffect(() => {
    const sessionManager = SessionManager.getInstance();
    
    // Check if there's an existing session on app load
    if (isAuthenticated && user) {
      // Check if session is still valid
      if (!sessionManager.isSessionValid()) {
        console.log('Existing session expired, logging out...');
        dispatch(initializeAuth()); // This will trigger logout if session is invalid
      } else {
        // Restart session management for existing user
        sessionManager.startSession(user.id);
      }
    }
    
    // Cleanup on unmount
    return () => {
      // Don't destroy session manager here as it should persist across route changes
      // Only destroy when user explicitly logs out
    };
  }, [isAuthenticated, user, dispatch]);

  if (loading) return <AttractiveLoader message="Loading session..." variant="fullscreen" />;

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
    <Provider store={store}>
      <PersistGate loading={<AttractiveLoader message="Loading..." variant="fullscreen" />} persistor={persistor}>
        <Router>
          <AppContent />
          <Toaster />
        </Router>
      </PersistGate>
    </Provider>
  );
};

export default App;
