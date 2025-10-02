import React, { useState, useEffect } from 'react';
import { HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiUserCircle } from 'react-icons/hi';
import { useUserAuth } from '../../hooks/useUserAuth';
import { Link, useNavigate } from 'react-router-dom';
import CharAvatar from '../Cards/CharAvatar';
import { toast } from 'react-hot-toast';

const Navbar = ({ activeMenu, onMenuToggle, isMobileMenuOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className='flex items-center justify-between bg-white border-b border-gray-200/50 backdrop-blur-[2px] py-3 px-6 sticky top-0 z-30'>
      <div className='flex items-center gap-4'>
        <button
          data-menu-button
          className="block lg:hidden text-gray-700 hover:text-gray-900"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <HiOutlineX className="text-2xl" />
          ) : (
            <HiOutlineMenu className='text-2xl' />
          )}
        </button>

        <Link to="/dashboard" className='text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors'>
          Expense Tracker
        </Link>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
          aria-haspopup="true"
        >
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.fullName || 'User'}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <CharAvatar 
              fullName={user?.fullName || 'U'} 
              width="w-8" 
              height="h-8" 
              style="text-sm" 
            />
          )}
          <span className="hidden md:inline-block">
            {user?.fullName || 'User'}
          </span>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="py-1">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                <HiUserCircle className="mr-2 h-5 w-5" />
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setShowUserMenu(false);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <HiOutlineLogout className="mr-2 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Side Menu is now handled in DashboardLayout */}
    </div>
  )
}

export default Navbar