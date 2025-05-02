import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchTasks, updateTask } from '../store/slices/taskSlice';
import { openModal, setCalendarView } from '../store/slices/uiSlice';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const CalendarPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const { calendarView } = useSelector((state: RootState) => state.ui);
  const [events, setEvents] = useState<any[]>([]);
  
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);
  
  useEffect(() => {
    if (tasks.length > 0) {
      const taskEvents = tasks.map(task => {
        // Determine color based on priority
        let backgroundColor = '#10B981'; // Default/Low - success color
        
        if (task.priority === 'medium') {
          backgroundColor = '#F59E0B'; // Warning color
        } else if (task.priority === 'high') {
          backgroundColor = '#EF4444'; // Error color
        } else if (task.priority === 'urgent') {
          backgroundColor = '#7C3AED'; // Purple color
        }
        
        // Mark completed tasks with a different style
        if (task.status === 'completed') {
          backgroundColor = '#9CA3AF'; // Gray color
        }
        
        return {
          id: task._id,
          title: task.title,
          start: task.dueDate,
          backgroundColor,
          borderColor: backgroundColor,
          textColor: '#FFFFFF',
          extendedProps: {
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignedTo: task.assignedTo,
          },
        };
      });
      
      setEvents(taskEvents);
    }
  }, [tasks]);
  
  const handleEventClick = (info: any) => {
    const taskId = info.event.id;
    const task = tasks.find(t => t._id === taskId);
    
    if (task) {
      dispatch(openModal({
        type: 'task',
        data: task,
      }));
    }
  };
  
  const handleEventDrop = async (info: any) => {
    const taskId = info.event.id;
    const newDate = info.event.start;
    
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      // Update the task with the new due date
      await dispatch(updateTask({
        taskId,
        taskData: {
          dueDate: newDate.toISOString(),
        },
      }));
    }
  };
  
  const handleViewChange = (view: 'day' | 'week' | 'month') => {
    dispatch(setCalendarView(view));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Calendar</h1>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewChange('day')}
            className={`px-3 py-1.5 rounded-md ${
              calendarView === 'day'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => handleViewChange('week')}
            className={`px-3 py-1.5 rounded-md ${
              calendarView === 'week'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange('month')}
            className={`px-3 py-1.5 rounded-md ${
              calendarView === 'month'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Month
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card p-4">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success-500"></span>
            <span className="text-sm text-gray-600">Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning-500"></span>
            <span className="text-sm text-gray-600">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-error-500"></span>
            <span className="text-sm text-gray-600">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent-600"></span>
            <span className="text-sm text-gray-600">Urgent Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400"></span>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={calendarView === 'day' ? 'timeGridDay' : calendarView === 'week' ? 'timeGridWeek' : 'dayGridMonth'}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: '',
              }}
              events={events}
              eventClick={handleEventClick}
              editable={true}
              eventDrop={handleEventDrop}
              height="auto"
              contentHeight={700}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;