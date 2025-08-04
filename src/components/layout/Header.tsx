import React from 'react';
import { 
  ChevronDown, 
  Menu, 
  Bell, 
} from 'lucide-react';

import {  useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggle, mobileOpen, onMobileToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const { user } = useAuth();

  const navigate = useNavigate();

  if (!user) return null;
  const userName = user.role === 'admin' ? 'Admin' : 
  user.role === 'stock-manager' ? 'Stock-manager' : 'Employee';



const handleNotification = () => {
  if (user?.role) {
    navigate(`/${user.role}/notifications`);
  }
};
  
  return (
    <div className="flex items-center justify-between w-full px-4 py-3 bg-white shadow-md sm:px-6">
      {/* Left: Logo & Mobile Menu Button */}
      <div className="flex items-center gap-4">
        <button
          className="text-gray-600 md:hidden hover:text-blue-600"
          onClick={() => {
            setIsMenuOpen(false);
            onMobileToggle();
          }}
        >
          <Menu size={24} />
        </button>


      </div>

   
      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button  onClick={handleNotification} className="relative text-gray-600 hover:text-blue-600">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <div
  className="flex items-center gap-1 px-5 cursor-pointer hover:text-blue-600"
  onClick={() => navigate(`/${user.role}/profile`)}
>
  <img
    src="https://i.pravatar.cc/300"
    alt="User"
    className="object-cover w-8 h-8 rounded-full"
  />
  <span className="hidden text-sm font-medium sm:block">{userName}</span>
  {/* <ChevronDown size={16} className="hidden sm:block" /> */}
</div>
      </div>

      {/* Mobile Search Bar */}
      {isMenuOpen && (
        <div className="absolute left-0 z-50 w-full px-4 py-3 bg-white border-t shadow-md top-full md:hidden">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 text-sm bg-gray-100 rounded-full focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};

export default Header;

