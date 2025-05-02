import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  notification: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null;
  modalOpen: {
    type: 'task' | 'profile' | 'team' | null;
    data?: any;
  };
  calendarView: 'month' | 'week' | 'day';
}

const initialState: UIState = {
  sidebarOpen: true,
  darkMode: localStorage.getItem('darkMode') === 'true',
  notification: null,
  modalOpen: {
    type: null,
  },
  calendarView: 'week',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },
    showNotification: (
      state,
      action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>
    ) => {
      state.notification = {
        show: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideNotification: (state) => {
      state.notification = null;
    },
    openModal: (state, action: PayloadAction<{ type: 'task' | 'profile' | 'team'; data?: any }>) => {
      state.modalOpen = {
        type: action.payload.type,
        data: action.payload.data,
      };
    },
    closeModal: (state) => {
      state.modalOpen = {
        type: null,
      };
    },
    setCalendarView: (state, action: PayloadAction<'month' | 'week' | 'day'>) => {
      state.calendarView = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  toggleDarkMode,
  showNotification,
  hideNotification,
  openModal,
  closeModal,
  setCalendarView,
} = uiSlice.actions;
export default uiSlice.reducer;