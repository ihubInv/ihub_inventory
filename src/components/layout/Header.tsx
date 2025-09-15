import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Menu, 
  Bell, 
  User,
  LogOut,
  Settings,
  X,
  Mail
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { useGetUnreadCountQuery } from '../../store/api';
import SessionStatus from '../common/SessionStatus';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
  onOpenEmailSetup: () => void; // New prop to open EmailSetup modal
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggle, mobileOpen, onMobileToggle, onOpenEmailSetup }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { data: unreadCount = 0 } = useGetUnreadCountQuery(user?.id || '', {
    skip: !user?.id
  });
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  if (!user) return null;

  const notificationCount = unreadCount;

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Administrator',
          color: 'from-[#0d559e] to-[#1a6bb8]',
          bgColor: 'bg-red-100 text-red-800'
        };
      case 'stock-manager':
        return {
          title: 'Stock Manager',
          color: 'from-[#0d559e] to-[#1a6bb8]',
          bgColor: 'bg-blue-100 text-blue-800'
        };
      case 'employee':
        return {
          title: 'Employee',
          color: 'from-[#0d559e] to-[#1a6bb8]',
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
    await dispatch(logoutUser()).unwrap();
    navigate('/login');
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      {/* Enhanced Main Header */}
      <div className="relative flex items-center justify-between w-full px-4 py-4 bg-white/90 backdrop-blur-lg shadow-xl sm:px-6 lg:px-8 border-b border-gray-200/50 z-40">
        
        {/* Left Section - Mobile Menu & Logo */}
        <div className="flex items-center space-x-4">
          {/* Enhanced Mobile Menu Button */}
          <button
            className="flex items-center justify-center p-3 text-gray-600 transition-all duration-200 rounded-xl lg:hidden hover:text-blue-600 hover:bg-blue-50 hover:scale-105 bg-white shadow-md border border-gray-200"
            onClick={onMobileToggle}
          >
            <Menu size={22} className="font-bold" />
          </button>

          {/* Enhanced Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0d559e] via-[#1a6bb8] to-[#2c7bc7] shadow-lg">
                <span className="text-lg font-bold text-white sm:text-xl">I</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse sm:w-4 sm:h-4"></div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#0d559e] to-[#1a6bb8] bg-clip-text text-transparent lg:text-2xl">
                iHub Inventory
              </h1>
              <p className="text-sm text-gray-500 font-medium">Management System</p>
            </div>
          </div>
        </div>

        {/* Center Section - User Info (Mobile) */}
        <div className="flex items-center space-x-2 lg:hidden">
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">{user.name}</p>
            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleInfo.bgColor}`}>
              {roleInfo.title}
            </span>
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Session Status - Desktop Only */}
          <div className="hidden lg:block">
            <SessionStatus />
          </div>
          
          {/* Notification Button */}
          <button 
            onClick={handleNotification}
            className="relative p-2 text-gray-600 transition-colors rounded-lg hover:text-blue-600 hover:bg-blue-50 bg-white shadow-sm border border-gray-200"
          >
            <Bell size={18} className="sm:w-5 sm:h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-red-500 rounded-full animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Desktop Profile Section */}
          <div className="relative hidden lg:block" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm border border-gray-200"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${roleInfo.color} flex items-center justify-center overflow-hidden`}>
                {user.profilepicture ? (
                  <img
                    src={user.profilepicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleInfo.bgColor}`}>
                  {roleInfo.title}
                </span>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Desktop Dropdown Menu - Fixed positioning and z-index */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full w-64 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-[45]">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${roleInfo.color} flex items-center justify-center overflow-hidden`}>
                      {user.profilepicture ? (
                        <img
                          src={user.profilepicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-medium text-white">
                          {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
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
                    onClick={() => {
                      handleProfile();
                      setIsProfileMenuOpen(false); // Close dropdown after action
                    }}
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
                  <div className="relative group">
                    <button
                      onClick={() => setIsProfileMenuOpen(false)} // Only close dropdown, do nothing else
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Mail size={16} className="mr-3" />
                      Email Settings
                    </button>
                    <span className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gradient-to-r from-[#0d559e] to-[#1a6bb8] text-white text-xs font-medium rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap ">
                      Coming Soon
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigate(`/${user.role}`);
                      setIsProfileMenuOpen(false); // Close dropdown after action
                    }}
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

      {/* Mobile Profile Menu - Fixed z-index */}
      {isProfileMenuOpen && (
        <div className="fixed inset-0 lg:hidden z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsProfileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${roleInfo.color} flex items-center justify-center overflow-hidden`}>
                  {user.profilepicture ? (
                    <img
                      src={user.profilepicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-white">
                      {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleInfo.bgColor}`}>
                    {roleInfo.title}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsProfileMenuOpen(false)}
                className="p-1 text-gray-400 transition-colors rounded hover:text-gray-600"
              >
                <X size={20} className="text-red-500" />
              </button>
            </div>
            
            <div className="p-4">
              {/* User Info Card */}
              <div className={`p-4 rounded-xl bg-gradient-to-r ${roleInfo.color} mb-4`}>
                <div className="text-center text-white">
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm opacity-90">{user.department || 'No Department'}</p>
                </div>
              </div>
              
              {/* Session Status - Mobile */}
              <div className="mb-4">
                <SessionStatus className="justify-center" />
              </div>
              
              {/* Menu Items */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleProfile();
                    setIsProfileMenuOpen(false); // Close dropdown after action
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-50 border border-gray-200"
                >
                  <User size={16} className="mr-3" />
                  View Profile
                </button>
                <button
                  onClick={handleNotification}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-50 border border-gray-200"
                >
                  <Bell size={16} className="mr-3" />
                  Notifications
                  {notificationCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
                <div className="relative group">
                  <button
                    onClick={() => setIsProfileMenuOpen(false)} // Only close dropdown, do nothing else
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-50 border border-gray-200"
                  >
                    <Mail size={16} className="mr-3" />
                    Email Settings
                  </button>
                  <span className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gradient-to-r from-[#0d559e] to-[#1a6bb8] text-white text-xs font-medium rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-lg">
                    Coming Soon
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigate(`/${user.role}`);
                    setIsProfileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 transition-colors rounded-lg hover:bg-gray-50 border border-gray-200"
                >
                  <Settings size={16} className="mr-3" />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsProfileMenuOpen(false); // Close dropdown after action
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 transition-colors rounded-lg hover:bg-red-50 border border-red-200"
                >
                  <LogOut size={16} className="mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;