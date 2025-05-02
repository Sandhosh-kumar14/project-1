import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToUser?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  dueDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  comments?: TaskComment[];
}

export interface TaskComment {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  currentTask: Task | null;
  filteredTasks: Task[];
  filters: {
    status: string | null;
    priority: string | null;
    assignedTo: string | null;
  };
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  currentTask: null,
  filteredTasks: [],
  filters: {
    status: null,
    priority: null,
    assignedTo: null,
  },
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await api.tasks.getTasks();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>, { rejectWithValue }) => {
    try {
      const response = await api.tasks.createTask(taskData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (
    { taskId, taskData }: { 
      taskId: string; 
      taskData: Partial<Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>> 
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.tasks.updateTask(taskId, taskData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await api.tasks.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const addTaskComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, content }: { taskId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.tasks.addComment(taskId, content);
      return { taskId, comment: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    setFilters: (state, action: PayloadAction<{ status?: string | null; priority?: string | null; assignedTo?: string | null }>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredTasks = filterTasks(state.tasks, state.filters);
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        priority: null,
        assignedTo: null,
      };
      state.filteredTasks = [...state.tasks];
    },
    updateTaskRealtime: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      } else {
        state.tasks.push(action.payload);
      }
      state.filteredTasks = filterTasks(state.tasks, state.filters);
      
      if (state.currentTask && state.currentTask._id === action.payload._id) {
        state.currentTask = action.payload;
      }
    },
    deleteTaskRealtime: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task._id !== action.payload);
      state.filteredTasks = filterTasks(state.tasks, state.filters);
      
      if (state.currentTask && state.currentTask._id === action.payload) {
        state.currentTask = null;
      }
    },
    addCommentRealtime: (state, action: PayloadAction<{ taskId: string; comment: TaskComment }>) => {
      const { taskId, comment } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task._id === taskId);
      
      if (taskIndex !== -1) {
        if (!state.tasks[taskIndex].comments) {
          state.tasks[taskIndex].comments = [];
        }
        state.tasks[taskIndex].comments!.push(comment);
        
        if (state.currentTask && state.currentTask._id === taskId) {
          if (!state.currentTask.comments) {
            state.currentTask.comments = [];
          }
          state.currentTask.comments!.push(comment);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.tasks = action.payload;
        state.filteredTasks = filterTasks(action.payload, state.filters);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
        state.filteredTasks = filterTasks(state.tasks, state.filters);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.filteredTasks = filterTasks(state.tasks, state.filters);
        
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        state.filteredTasks = filterTasks(state.tasks, state.filters);
        
        if (state.currentTask && state.currentTask._id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addTaskComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTaskComment.fulfilled, (state, action: PayloadAction<{ taskId: string; comment: TaskComment }>) => {
        state.loading = false;
        const { taskId, comment } = action.payload;
        const taskIndex = state.tasks.findIndex(task => task._id === taskId);
        
        if (taskIndex !== -1) {
          if (!state.tasks[taskIndex].comments) {
            state.tasks[taskIndex].comments = [];
          }
          state.tasks[taskIndex].comments!.push(comment);
          
          if (state.currentTask && state.currentTask._id === taskId) {
            if (!state.currentTask.comments) {
              state.currentTask.comments = [];
            }
            state.currentTask.comments!.push(comment);
          }
        }
      })
      .addCase(addTaskComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Helper function to filter tasks
const filterTasks = (tasks: Task[], filters: TasksState['filters']) => {
  return tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assignedTo && task.assignedTo !== filters.assignedTo) return false;
    return true;
  });
};

export const { setCurrentTask, setFilters, clearFilters, updateTaskRealtime, deleteTaskRealtime, addCommentRealtime } = taskSlice.actions;
export default taskSlice.reducer;