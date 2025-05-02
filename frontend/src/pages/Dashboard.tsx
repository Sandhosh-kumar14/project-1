import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchTasks } from '../store/slices/taskSlice';
import { fetchTeamMembers } from '../store/slices/teamSlice';
import { AlertCircle, CheckCircle, Clock, List, ListChecks, User, Users, ArrowUpCircle } from 'lucide-react';
import TaskCard from '../components/tasks/TaskCard';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading: tasksLoading } = useSelector((state: RootState) => state.tasks);
  const { members, loading: membersLoading } = useSelector((state: RootState) => state.team);
  const { user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchTeamMembers());
  }, [dispatch]);
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const myTasks = tasks.filter(task => task.assignedTo === user?.id).length;
  const overdueTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < new Date() && task.status !== 'completed';
  }).length;
  
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' || task.priority === 'urgent');
  
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  
  const onlineTeamMembers = members.filter(member => member.isOnline).length;
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div className="text-gray-500">Total Tasks</div>
            <List className="h-6 w-6 text-gray-400" />
          </div>
          <div className="mt-4 text-3xl font-semibold text-gray-800">{totalTasks}</div>
          <div className="mt-2 text-sm text-gray-500">Across all projects</div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div className="text-gray-500">Completed</div>
            <ListChecks className="h-6 w-6 text-green-500" />
          </div>
          <div className="mt-4 text-3xl font-semibold text-gray-800">{completedTasks}</div>
          <div className="mt-2 text-sm text-gray-500">
            {completedTasks > 0 && totalTasks > 0
              ? `${Math.round((completedTasks / totalTasks) * 100)}% of total tasks`
              : 'No tasks completed yet'}
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div className="text-gray-500">My Tasks</div>
            <User className="h-6 w-6 text-primary-500" />
          </div>
          <div className="mt-4 text-3xl font-semibold text-gray-800">{myTasks}</div>
          <div className="mt-2 text-sm text-gray-500">Assigned to you</div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-card">
          <div className="flex items-center justify-between">
            <div className="text-gray-500">{overdueTasks > 0 ? 'Overdue' : 'Team Online'}</div>
            {overdueTasks > 0 ? (
              <AlertCircle className="h-6 w-6 text-error-500" />
            ) : (
              <Users className="h-6 w-6 text-secondary-500" />
            )}
          </div>
          <div className="mt-4 text-3xl font-semibold text-gray-800">
            {overdueTasks > 0 ? overdueTasks : onlineTeamMembers}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {overdueTasks > 0 ? 'Tasks past due date' : `${onlineTeamMembers} of ${members.length} members`}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">High Priority Tasks</h2>
          {tasksLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : highPriorityTasks.length > 0 ? (
            <div className="space-y-4">
              {highPriorityTasks.slice(0, 4).map(task => (
                <TaskCard key={task._id} task={task} />
              ))}
              {highPriorityTasks.length > 4 && (
                <div className="text-center pt-2">
                  <a href="/tasks" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    View all high priority tasks
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 text-success-500 mb-2" />
              <p>No high priority tasks at the moment</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
          {tasksLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : recentTasks.length > 0 ? (
            <div className="space-y-4">
              {recentTasks.map(task => (
                <div key={task._id} className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <div className="flex-shrink-0 mt-1">
                    {task.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-success-500" />
                    ) : task.priority === 'high' || task.priority === 'urgent' ? (
                      <ArrowUpCircle className="h-5 w-5 text-error-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-secondary-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {task.status === 'completed' 
                        ? 'Marked as completed' 
                        : task.status === 'in_progress' 
                        ? 'Started working on' 
                        : 'Updated'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(task.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Clock className="h-12 w-12 text-gray-300 mb-2" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;