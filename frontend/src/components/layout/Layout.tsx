import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Notification from '../common/Notification';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { loadUser } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import SocketProvider from '../../services/SocketProvider';
import Modal from '../common/Modal';
import TaskForm from '../tasks/TaskForm';
import ProfileForm from '../profile/ProfileForm';
import TeamView from '../team/TeamView';

const Layout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen, notification, modalOpen } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <Header />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
        
        {notification && <Notification />}

        {modalOpen.type === 'task' && (
          <Modal>
            <TaskForm task={modalOpen.data} />
          </Modal>
        )}

        {modalOpen.type === 'profile' && (
          <Modal>
            <ProfileForm user={user} />
          </Modal>
        )}

        {modalOpen.type === 'team' && (
          <Modal>
            <TeamView />
          </Modal>
        )}
      </div>
    </SocketProvider>
  );
};

export default Layout;