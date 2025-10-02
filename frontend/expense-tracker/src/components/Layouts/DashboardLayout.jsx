import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import SideMenu from './SideMenu';
import Navbar from './Navbar';
import { Navigate, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children, activeMenu }) => {
  const { user, loading } = useUserAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.querySelector('[data-menu-button]');
      
      if (sidebar && !sidebar.contains(event.target) && 
          menuButton && !menuButton.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        activeMenu={activeMenu} 
        onMenuToggle={toggleMobileMenu} 
        isMobileMenuOpen={mobileMenuOpen}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        <div 
          id="mobile-sidebar"
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SideMenu activeMenu={activeMenu} />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:static lg:shrink-0">
          <SideMenu activeMenu={activeMenu} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;