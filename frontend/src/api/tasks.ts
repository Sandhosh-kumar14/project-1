import axios from './axios';
import { Task, TaskComment } from '../store/slices/taskSlice';

export const getTasks = async (): Promise<Task[]> => {
  const response = await axios.get('/tasks');
  return response.data;
};

export const createTask = async (
  taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>
): Promise<Task> => {
  const response = await axios.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (
  taskId: string,
  taskData: Partial<Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>>
): Promise<Task> => {
  const response = await axios.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await axios.delete(`/tasks/${taskId}`);
};

export const addComment = async (taskId: string, content: string): Promise<TaskComment> => {
  const response = await axios.post(`/tasks/${taskId}/comments`, { content });
  return response.data;
};