import axios from './axios';
import { TeamMember } from '../store/slices/teamSlice';

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const response = await axios.get('/users');
  return response.data;
};