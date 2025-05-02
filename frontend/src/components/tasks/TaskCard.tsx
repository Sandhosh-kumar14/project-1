import React from 'react';
import { useDispatch } from 'react-redux';
import { openModal } from '../../store/slices/uiSlice';
import { formatDistanceToNow } from 'date-fns';
import { Task } from '../../store/slices/taskSlice';
import { 
  AlertTriangle, 
  ArrowUpCircle,
  Clock, 
  MinusCircle,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const dispatch = useDispatch();
  
  const handleClick = () => {
    dispatch(openModal({
      type: 'task',
      data: task,
    }));
  };
  
  const getStatusColor = () => {
    switch (task.status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-error-500" />;
      case 'high':
        return <ArrowUpCircle className="h-4 w-4 text-error-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-warning-500" />;
      case 'low':
        return <MinusCircle className="h-4 w-4 text-success-500" />;
      default:
        return <MinusCircle className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const formatStatus = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };
  
  const isDueToday = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  };
  
  const isOverdue = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== 'completed';
  };
  
  return (
    <div 
      onClick={handleClick}
      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:shadow-card-hover transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-800">{task.title}</h3>
        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor()}`}>
          {formatStatus(task.status)}
        </span>
      </div>
      
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{task.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getPriorityIcon()}
          <span className="text-xs text-gray-500 capitalize">{task.priority}</span>
        </div>
        
        {task.dueDate && (
          <div className={`text-xs ${
            isOverdue() 
              ? 'text-error-500' 
              : isDueToday() 
              ? 'text-warning-500' 
              : 'text-gray-500'
          }`}>
            {isOverdue() 
              ? 'Overdue' 
              : isDueToday() 
              ? 'Due today' 
              : `Due ${formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}`}
          </div>
        )}
      </div>
      
      {task.assignedToUser && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
              {task.assignedToUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500">{task.assignedToUser.name}</span>
          </div>
          
          {task.comments && task.comments.length > 0 && (
            <span className="text-xs text-gray-500">
              {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;