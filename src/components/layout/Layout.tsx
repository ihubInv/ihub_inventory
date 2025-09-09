import React from 'react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import EmailSetup from '../common/EmailSetup';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEmailSetupModal, setShowEmailSetupModal] = useState(false);

  const handleOpenEmailSetup = () => {
    setShowEmailSetupModal(true);
  };

  const handleCloseEmailSetup = () => {
    setShowEmailSetupModal(false);
  };

  return (
    <div className="relative flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={sidebarOpen}
        onMobileToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <Header 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={sidebarOpen}
        onMobileToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenEmailSetup={handleOpenEmailSetup}
         />
        <main className="flex-1 p-3 overflow-y-auto bg-gray-50 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>

      {showEmailSetupModal && (
        <EmailSetup onClose={handleCloseEmailSetup} />
      )}
    </div>
  );
};

export default Layout;