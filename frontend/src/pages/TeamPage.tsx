import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchTeamMembers } from '../store/slices/teamSlice';
import { fetchTasks } from '../store/slices/taskSlice';
import { User, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TeamPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading: membersLoading } = useSelector((state: RootState) => state.team);
  const { tasks, loading: tasksLoading } = useSelector((state: RootState) => state.tasks);
  
  useEffect(() => {
    dispatch(fetchTeamMembers());
    dispatch(fetchTasks());
  }, [dispatch]);
  
  const getMemberStats = (memberId: string) => {
    const memberTasks = tasks.filter(task => task.assignedTo === memberId);
    const totalTasks = memberTasks.length;
    const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = memberTasks.filter(task => task.status === 'in_progress').length;
    const overdueTasks = memberTasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date() && task.status !== 'completed';
    }).length;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  };
  
  if (membersLoading || tasksLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Team Members</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {members.map(member => {
          const stats = getMemberStats(member._id);
          
          return (
            <div 
              key={member._id}
              className="bg-white rounded-lg shadow-card overflow-hidden"
            >
              <div className="p-6 flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xl ${
                  member.isOnline ? 'ring-2 ring-green-400' : ''
                }`}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{member.name}</h3>
                      <span className="text-sm text-gray-500 capitalize">{member.role}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full w-fit ${
                      member.isOnline 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {member.email}
                    </span>
                    {!member.isOnline && member.lastActive && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Last seen {formatDistanceToNow(new Date(member.lastActive))} ago
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-800">{stats.totalTasks}</div>
                  <div className="text-xs text-gray-500">Total Tasks</div>
                </div>
                
                <div>
                  <div className="text-lg font-semibold text-success-500">{stats.completedTasks}</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                
                <div>
                  <div className="text-lg font-semibold text-secondary-500">{stats.inProgressTasks}</div>
                  <div className="text-xs text-gray-500">In Progress</div>
                </div>
                
                <div>
                  <div className={`text-lg font-semibold ${stats.overdueTasks > 0 ? 'text-error-500' : 'text-gray-400'}`}>
                    {stats.overdueTasks}
                  </div>
                  <div className="text-xs text-gray-500">Overdue</div>
                </div>
              </div>
              
              <div className="px-4 py-3 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stats.completionRate >= 75 ? 'bg-success-500' : 
                      stats.completionRate >= 50 ? 'bg-secondary-500' : 
                      stats.completionRate >= 25 ? 'bg-warning-500' : 
                      'bg-error-500'
                    }`}
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">{stats.completionRate}% Complete</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamPage;