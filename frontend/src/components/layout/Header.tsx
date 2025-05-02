import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { openModal } from '../../store/slices/uiSlice';
import { Bell, PlusCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const getPageTitle = (): string => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/tasks')) return 'Tasks';
    if (path.includes('/calendar')) return 'Calendar';
    if (path.includes('/team')) return 'Team';
    if (path.includes('/settings')) return 'Settings';
    
    return 'Dashboard';
  };

  const handleCreateTask = () => {
    dispatch(openModal({ type: 'task' }));
  };

  const handleOpenProfile = () => {
    dispatch(openModal({ type: 'profile', data: user }));
  };

  return (
    <header className="bg-white h-16 px-6 flex items-center justify-between shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button
          onClick={handleCreateTask}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Task</span>
        </button>
        
        <button onClick={handleOpenProfile} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{user?.name}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;