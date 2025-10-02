import React, { useEffect } from 'react';
import {SIDE_MENU_DATA} from '../../utils/data';
import { useUserAuth } from '../../hooks/useUserAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import CharAvatar from '../Cards/CharAvatar';

const SideMenu = ({activeMenu, onLinkClick}) => {
  const { user, clearUser } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    if (onLinkClick) {
      onLinkClick();
    }
  }, [location.pathname]);

  const handleClick = (route) => {
    if (route === "/logout") {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  // Don't render anything if user is not loaded yet
  if (!user) {
    return null;
  }

  return (
    <div className='w-full h-full bg-white p-5 overflow-y-auto'>
      <div className='flex flex-col items-center justify-center gap-3 mt-3 mb-7'>
        {user?.profileImageUrl ? (
          <img 
            src={user.profileImageUrl}
            alt='Profile'
            className='w-20 h-20 rounded-full object-cover border-2 border-gray-200'
          />
        ) : (
          <CharAvatar
            fullName={user.fullName}
            width="w-20"
            height="h-20"
            style="text-xl"
          />
        )}
        <h5 className='text-gray-900 font-medium text-center'>
          {user.fullName || 'User'}
        </h5>
        <p className='text-sm text-gray-500'>{user.email}</p>
      </div>

      <nav className='space-y-1'>
        {SIDE_MENU_DATA.map((item, index) => (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 ${
              activeMenu === item.label ? 'text-white bg-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-xl" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default SideMenu;