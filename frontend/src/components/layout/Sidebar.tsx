import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { 
  Home, 
  ListTodo, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronLeft 
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/tasks', name: 'Tasks', icon: <ListTodo className="h-5 w-5" /> },
    { path: '/calendar', name: 'Calendar', icon: <Calendar className="h-5 w-5" /> },
    { path: '/team', name: 'Team', icon: <Users className="h-5 w-5" /> },
    { path: '/settings', name: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-full bg-white shadow-md transition-all duration-300 z-10 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {sidebarOpen && (
          <h1 className="text-xl font-bold text-primary-500">TaskFlow</h1>
        )}
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {user && (
        <div className={`flex items-center gap-3 p-4 border-b ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-medium text-sm">{user.name}</span>
              <span className="text-xs text-gray-500 capitalize">{user.role}</span>
            </div>
          )}
        </div>
      )}

      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {item.icon}
            {sidebarOpen && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        <button
          onClick={handleLogout}
          className={`flex items-center ${sidebarOpen ? 'gap-3 px-3 w-full' : 'justify-center w-full'} py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors`}
        >
          <LogOut className="h-5 w-5" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;