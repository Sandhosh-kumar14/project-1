import axios from './axios';
import { User } from '../store/slices/authSlice';

export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  const response = await axios.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<{ token: string; user: User }> => {
  const response = await axios.post('/auth/register', { name, email, password });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await axios.get('/auth/me');
  return response.data;
};