import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api';

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  isOnline?: boolean;
  lastActive?: string;
}

interface TeamState {
  members: TeamMember[];
  onlineMembers: string[];
  loading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  members: [],
  onlineMembers: [],
  loading: false,
  error: null,
};

export const fetchTeamMembers = createAsyncThunk('team/fetchMembers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.team.getTeamMembers();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch team members');
  }
});

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setOnlineMembers: (state, action: PayloadAction<string[]>) => {
      state.onlineMembers = action.payload;
      
      // Update the isOnline property of team members
      state.members.forEach(member => {
        member.isOnline = state.onlineMembers.includes(member._id);
      });
    },
    memberConnected: (state, action: PayloadAction<string>) => {
      if (!state.onlineMembers.includes(action.payload)) {
        state.onlineMembers.push(action.payload);
      }
      
      // Update the isOnline property
      const memberIndex = state.members.findIndex(m => m._id === action.payload);
      if (memberIndex !== -1) {
        state.members[memberIndex].isOnline = true;
      }
    },
    memberDisconnected: (state, action: PayloadAction<string>) => {
      state.onlineMembers = state.onlineMembers.filter(id => id !== action.payload);
      
      // Update the isOnline property
      const memberIndex = state.members.findIndex(m => m._id === action.payload);
      if (memberIndex !== -1) {
        state.members[memberIndex].isOnline = false;
        state.members[memberIndex].lastActive = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action: PayloadAction<TeamMember[]>) => {
        state.loading = false;
        state.members = action.payload.map(member => ({
          ...member,
          isOnline: state.onlineMembers.includes(member._id),
        }));
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setOnlineMembers, memberConnected, memberDisconnected } = teamSlice.actions;
export default teamSlice.reducer;