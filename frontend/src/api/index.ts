import { login, register, getCurrentUser } from './auth';
import { getTasks, createTask, updateTask, deleteTask, addComment } from './tasks';
import { getTeamMembers } from './team';

const api = {
  auth: {
    login,
    register,
    getCurrentUser,
  },
  tasks: {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    addComment,
  },
  team: {
    getTeamMembers,
  },
};

export default api;