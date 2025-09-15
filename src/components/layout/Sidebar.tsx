import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { useGetUnreadCountQuery } from '../../store/api';
import { 
  LayoutDashboard, 
  Package, 
  PackagePlus, 
  Users, 
  Bell, 
  User, 
  LogOut,
  FileText,
  ClipboardList,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  MapPin,
  UserCheck
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, mobileOpen, onMobileToggle }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { data: unreadCount = 0 } = useGetUnreadCountQuery(user?.id || '', {
    skip: !user?.id
  });
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const getMenuItems = () => {
    const baseUrl = user.role === 'admin' ? '/admin' : 
                   user.role === 'stock-manager' ? '/stock-manager' : '/employee';

    switch (user.role) {
      case 'admin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: `${baseUrl}` },
          { icon: PackagePlus, label: 'Add Inventory', path: `${baseUrl}/add-inventory` },
          { icon: FolderPlus, label: 'Add Category', path: `${baseUrl}/add-category` },
          { icon: Package, label: 'Total Inventory', path: `${baseUrl}/inventory` },
          { icon: UserCheck, label: 'Issued Items', path: `${baseUrl}/issued-items` },
          { icon: MapPin, label: 'Location Management', path: `${baseUrl}/location` },
          { icon: Users, label: 'User Management', path: `${baseUrl}/users` },
           { icon: TrendingDown, label: 'Depreciation Report', path: `${baseUrl}/depreciation-report` },
          // { icon: Bell, label: 'Notifications', path: `${baseUrl}/notifications`, badge: unreadCount },
          { icon: User, label: 'Profile', path: `${baseUrl}/profile` },
        ];
      
      case 'stock-manager':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: `${baseUrl}` },
          { icon: PackagePlus, label: 'Add Inventory', path: `${baseUrl}/add-inventory` },
          { icon: FolderPlus, label: 'Add Category', path: `${baseUrl}/add-category` },
          { icon: Package, label: 'Total Inventory', path: `${baseUrl}/inventory` },
          { icon: UserCheck, label: 'Issued Items', path: `${baseUrl}/issued-items` },
          { icon: MapPin, label: 'Location Management', path: `${baseUrl}/location` },
          { icon: Users, label: 'User Management', path: `${baseUrl}/users` },
           { icon: TrendingDown, label: 'Depreciation Report', path: `${baseUrl}/depreciation-report` },
          // { icon: Bell, label: 'Notifications', path: `${baseUrl}/notifications`, badge: unreadCount },
          { icon: User, label: 'Profile', path: `${baseUrl}/profile` },
        ];
      
      case 'employee':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: `${baseUrl}` },
          { icon: FileText, label: 'Request Status', path: `${baseUrl}/requests` },
          { icon: ClipboardList, label: 'Create Request', path: `${baseUrl}/create-request` },
          { icon: UserCheck, label: 'My Issued Items', path: `${baseUrl}/issued-items` },
          { icon: Bell, label: 'Notifications', path: `${baseUrl}/notifications`, badge: unreadCount },
          { icon: User, label: 'Profile', path: `${baseUrl}/profile` },
        ];
      
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close mobile sidebar after navigation
    if (mobileOpen) {
      onMobileToggle();
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      navigate('/login');
    }
  };

  return (
    <>
      {/* Enhanced Desktop Sidebar */}
      <div className={`hidden lg:flex bg-white/95 backdrop-blur-lg shadow-2xl flex-col h-full fixed left-0 top-0 z-40 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
      
      <div
      onClick={onToggle}
      className={`flex items-center justify-between cursor-pointer p-4 border-b border-gray-100 transition-all hover:bg-gray-50 ${
        collapsed ? 'px-2' : 'px-6'
      }`}
    >
      {/* Enhanced Logo + Title */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#0d559e] via-[#1a6bb8] to-[#2c7bc7] hover:from-[#0a4a8a] hover:via-[#155a9e] hover:to-[#256bb6] rounded-2xl shadow-lg transition-all duration-200 hover:scale-105">
            <span className="text-lg font-bold text-white">I</span>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#0d559e] to-[#1a6bb8] bg-clip-text text-transparent">Inventory</h1>
            <p className="-mt-1 text-sm text-gray-500 font-medium">Management</p>
          </div>
        )}
      </div>

      {/* Chevron icon (optional if not collapsed) */}
      {!collapsed && (
        <ChevronLeft size={20} className="text-gray-500 transition hover:text-gray-700" />
      )}
    </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#0d559e] to-[#1a6bb8] overflow-hidden">
                {user.profilepicture ? (
                  <img
                    src={user.profilepicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== '/admin' && item.path !== '/stock-manager' && item.path !== '/employee' && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0d559e] via-[#1a6bb8] to-[#2c7bc7] hover:from-[#0a4a8a] hover:via-[#155a9e] hover:to-[#256bb6] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={collapsed ? item.label : ''}
              >
                <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
                  <item.icon size={20} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </div>
                {!collapsed && item.badge && item.badge > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive ? 'bg-gradient-to-r from-[#0d559e] via-[#1a6bb8] to-[#2c7bc7] hover:from-[#0a4a8a] hover:via-[#155a9e] hover:to-[#256bb6]' : 'bg-red-500 text-white'
                  }`}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200`}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut size={20} />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#0d559e] via-[#1a6bb8] to-[#2c7bc7] hover:from-[#0a4a8a] hover:via-[#155a9e] hover:to-[#256bb6] rounded-xl">
              <span className="text-lg font-bold text-white">IM</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
              <p className="text-sm text-gray-500">Management</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#0d559e] to-[#1a6bb8] overflow-hidden">
              {user.profilepicture ? (
                <img
                  src={user.profilepicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-white">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('-', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== '/admin' && item.path !== '/stock-manager' && item.path !== '/employee' && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0d559e] via-[#1a6bb8] to-[#2c7bc7] hover:from-[#0a4a8a] hover:via-[#155a9e] hover:to-[#256bb6]  shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive ? 'bg-gradient-to-r from-[#0d559e] via-[#1a6bb8] to-[#2c7bc7] hover:from-[#0a4a8a] hover:via-[#155a9e] hover:to-[#256bb6]' : 'bg-red-500 text-white'
                  }`}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 space-x-3 text-left text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;