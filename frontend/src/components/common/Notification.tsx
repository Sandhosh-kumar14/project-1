import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { hideNotification } from '../../store/slices/uiSlice';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Notification: React.FC = () => {
  const dispatch = useDispatch();
  const { notification } = useSelector((state: RootState) => state.ui);
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);
  
  if (!notification) return null;
  
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-white" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-white" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-white" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-white" />;
    }
  };
  
  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-success-500';
      case 'error':
        return 'bg-error-500';
      case 'warning':
        return 'bg-warning-500';
      case 'info':
      default:
        return 'bg-secondary-500';
    }
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`${getBgColor()} rounded-md p-4 flex items-center gap-3 text-white shadow-lg max-w-md`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
        <button 
          onClick={() => dispatch(hideNotification())}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Notification;