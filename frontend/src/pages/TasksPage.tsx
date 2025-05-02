import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchTasks, setFilters, clearFilters } from '../store/slices/taskSlice';
import { fetchTeamMembers } from '../store/slices/teamSlice';
import { openModal } from '../store/slices/uiSlice';
import TaskCard from '../components/tasks/TaskCard';
import { Filter, PlusCircle, RefreshCcw, Search } from 'lucide-react';

const TasksPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, filteredTasks, filters, loading } = useSelector((state: RootState) => state.tasks);
  const { members } = useSelector((state: RootState) => state.team);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayTasks, setDisplayTasks] = useState(filteredTasks);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchTeamMembers());
  }, [dispatch]);
  
  useEffect(() => {
    let result = filteredTasks;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(term) || 
          task.description.toLowerCase().includes(term)
      );
    }
    
    setDisplayTasks(result);
  }, [filteredTasks, searchTerm]);
  
  const handleCreateTask = () => {
    dispatch(openModal({ type: 'task' }));
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (filterType: string, value: string | null) => {
    if (filterType === 'status') {
      dispatch(setFilters({ status: value }));
    } else if (filterType === 'priority') {
      dispatch(setFilters({ priority: value }));
    } else if (filterType === 'assignedTo') {
      dispatch(setFilters({ assignedTo: value }));
    }
  };
  
  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchTerm('');
  };
  
  const getTaskCountByStatus = (status: string) => {
    return tasks.filter(task => task.status === status).length;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Tasks</h1>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:flex-none md:min-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Filter className="h-5 w-5 text-gray-600" />
          </button>
          
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden md:inline">New Task</span>
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">Filters</h3>
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
            >
              <RefreshCcw className="h-3 w-3" />
              Clear filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority-filter"
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="assignee-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                id="assignee-filter"
                value={filters.assignedTo || ''}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Team Members</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-card flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-semibold text-gray-800">
              {getTaskCountByStatus('todo')}
            </div>
            <div className="text-sm text-gray-500">To Do</div>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-card flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-semibold text-gray-800">
              {getTaskCountByStatus('in_progress')}
            </div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-card flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-semibold text-gray-800">
              {getTaskCountByStatus('review')}
            </div>
            <div className="text-sm text-gray-500">In Review</div>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-card flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-semibold text-gray-800">
              {getTaskCountByStatus('completed')}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>
        
        <div className="col-span-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {(searchTerm || (filters.status || filters.priority || filters.assignedTo)) 
              ? 'Filtered Tasks' 
              : 'All Tasks'}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({displayTasks.length} tasks)
            </span>
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : displayTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTasks.map(task => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-card p-8 text-center">
              <p className="text-gray-500">No tasks found matching your criteria.</p>
              {(searchTerm || (filters.status || filters.priority || filters.assignedTo)) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;