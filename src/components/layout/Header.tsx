import React, { useState } from 'react';
import { 
  ChevronDown, 
  Menu, 
  Bell, 
  User,
  LogOut,
  Settings,
  X
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useInventory } from '../../contexts/InventoryContext';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggle, mobileOpen, onMobileToggle }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { requests } = useInventory();
  const navigate = useNavigate();

  if (!user) return null;

  // Calculate notification count based on user role
  const getNotificationCount = () => {
    if (user.role === 'employee') {
      // Employees see count of their own pending requests
      return requests.filter(req => req.employeeid === user.id && req.status === 'pending').length;
    } else if (user.role === 'admin' || user.role === 'stock-manager') {
      // Admins and stock managers see count of all pending requests
      return requests.filter(req => req.status === 'pending').length;
    }
    return 0;
  };

  const notificationCount = getNotificationCount();

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Administrator',
          color: 'from-red-500 to-pink-600',
          bgColor: 'bg-red-100 text-red-800'
        };
      case 'stock-manager':
        return {
          title: 'Stock Manager',
          color: 'from-blue-500 to-purple-600',
          bgColor: 'bg-blue-100 text-blue-800'
        };
      case 'employee':
        return {
          title: 'Employee',
          color: 'from-green-500 to-teal-600',
          bgColor: 'bg-green-100 text-green-800'
        };
      default:
        return {
          title: 'User',
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const roleInfo = getRoleInfo(user.role);

  const handleNotification = () => {
    if (user?.role) {
      navigate(`/${user.role}/notifications`);
    }
  };

  const handleProfile = () => {
    if (user?.role) {
      navigate(`/${user.role}/profile`);
    }
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      {/* Main Header */}
      <div className="relative flex items-center justify-between w-full px-3 py-3 bg-white shadow-lg sm:px-4 lg:px-6 border-b border-gray-200">
        
        {/* Left Section - Mobile Menu & Logo */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            className="p-2 text-gray-600 transition-colors rounded-lg md:hidden hover:text-blue-600 hover:bg-blue-50"
            onClick={onMobileToggle}
          >
            <Menu size={20} />
          </button>

          {/* Logo & Title - Hidden on mobile when sidebar is open */}
          <div className={`flex items-center space-x-3 ${mobileOpen ? 'hidden' : 'flex'} md:flex`}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 sm:w-10 sm:h-10">
              <span className="text-sm font-bold text-white sm:text-lg">IM</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 lg:text-xl">iHub Inventory</h1>
              <p className="text-xs text-gray-500 lg:text-sm">Management System</p>
            </div>
          </div>
        </div>

        {/* Center Section - User Info (Mobile) */}
        <div className="flex items-center space-x-2 md:hidden">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleInfo.bgColor}`}>
              {roleInfo.title}
            </span>
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Notification Button */}
          <button 
            onClick={handleNotification}
            className="relative p-2 text-gray-600 transition-colors rounded-lg hover:text-blue-600 hover:bg-blue-50"
          >
            <Bell size={18} className="sm:w-5 sm:h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-red-500 rounded-full animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Desktop Profile Section */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${roleInfo.color} flex items-center justify-center overflow-hidden`}>
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleInfo.bgColor}`}>
                  {roleInfo.title}
                </span>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Desktop Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 z-50 w-64 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${roleInfo.color} flex items-center justify-center overflow-hidden`}>
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-medium text-white">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleInfo.bgColor} mt-1`}>
                        {roleInfo.title}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <button
                    onClick={handleProfile}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <User size={16} className="mr-3" />
                    View Profile
                  </button>
                  <button
                    onClick={handleNotification}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Bell size={16} className="mr-3" />
                    Notifications
                    {notificationCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/${user.role}`)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Settings size={16} className="mr-3" />
                    Dashboard
                  </button>
                </div>
                
                <div className="py-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={16} className="mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Profile Menu */}
      {isProfileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsProfileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Profile Menu</h3>
              <button
                onClick={() => setIsProfileMenuOpen(false)}
                className="p-1 text-gray-400 transition-colors rounded hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-2">
              <button
                onClick={handleProfile}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
              >
                <User size={16} className="mr-3" />
                View Profile
              </button>
              <button
                onClick={handleNotification}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
              >
                <Bell size={16} className="mr-3" />
                Notifications
                {notificationCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  navigate(`/${user.role}`);
                  setIsProfileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-50"
              >
                <Settings size={16} className="mr-3" />
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm text-red-600 transition-colors rounded-lg hover:bg-red-50"
              >
                <LogOut size={16} className="mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;