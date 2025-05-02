import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  setOnlineMembers, 
  memberConnected, 
  memberDisconnected 
} from '../store/slices/teamSlice';
import { 
  updateTaskRealtime, 
  deleteTaskRealtime, 
  addCommentRealtime, 
  Task, 
  TaskComment 
} from '../store/slices/taskSlice';
import { showNotification } from '../store/slices/uiSlice';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

const SOCKET_URL = 'http://localhost:5000';

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user || !token) return;

    // Connect to socket with auth token
    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Team events
    newSocket.on('online_members', (memberIds: string[]) => {
      dispatch(setOnlineMembers(memberIds));
    });

    newSocket.on('member_connected', (memberId: string) => {
      dispatch(memberConnected(memberId));
    });

    newSocket.on('member_disconnected', (memberId: string) => {
      dispatch(memberDisconnected(memberId));
    });

    // Task events
    newSocket.on('task_created', (task: Task) => {
      dispatch(updateTaskRealtime(task));
      
      // Only show notification if it's assigned to current user
      if (task.assignedTo === user.id) {
        dispatch(showNotification({
          message: `New task assigned to you: ${task.title}`,
          type: 'info',
        }));
      }
    });

    newSocket.on('task_updated', (task: Task) => {
      dispatch(updateTaskRealtime(task));
      
      // Only show notification for status changes to completed
      if (task.status === 'completed') {
        dispatch(showNotification({
          message: `Task completed: ${task.title}`,
          type: 'success',
        }));
      }
    });

    newSocket.on('task_deleted', (taskId: string) => {
      dispatch(deleteTaskRealtime(taskId));
    });

    newSocket.on('task_comment_added', (data: { taskId: string; comment: TaskComment }) => {
      dispatch(addCommentRealtime(data));
      
      // Only show notification if it's a task assigned to current user
      // and the comment is not from the current user
      if (data.comment.user._id !== user.id) {
        dispatch(showNotification({
          message: `New comment on task: ${data.comment.user.name}`,
          type: 'info',
        }));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;