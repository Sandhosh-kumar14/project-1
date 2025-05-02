import Task from '../models/Task.js';
import User from '../models/User.js';


// Get all tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name avatar')
      .populate('createdBy', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ updatedAt: -1 });
    
    // Transform data for frontend
    const transformedTasks = tasks.map(task => {
      const taskObj = task.toObject();
      
      // Transform assignedTo to match frontend expectations
      if (taskObj.assignedTo) {
        taskObj.assignedToUser = {
          _id: taskObj.assignedTo._id,
          name: taskObj.assignedTo.name,
          avatar: taskObj.assignedTo.avatar,
        };
      }
      
      return taskObj;
    });
    
    res.json(transformedTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    
    // Create task
    const task = new Task({
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      createdBy: req.user.id,
    });
    
    await task.save();
    
    // Populate fields for response
    await task.populate('assignedTo', 'name avatar');
    await task.populate('createdBy', 'name avatar');
    
    // Transform for frontend
    const taskObj = task.toObject();
    if (taskObj.assignedTo) {
      taskObj.assignedToUser = {
        _id: taskObj.assignedTo._id,
        name: taskObj.assignedTo.name,
        avatar: taskObj.assignedTo.avatar,
      };
    }
    
    // Emit socket event
    const io = req.app.get('io');
    io.emit('task_created', taskObj);
    
    // If task is assigned to someone, send notification to that user
    if (assignedTo) {
      io.to(assignedTo.toString()).emit('notification', {
        type: 'task_assigned',
        message: `You have been assigned a new task: ${title}`,
        task: taskObj._id,
      });
    }

    res.status(201).json(taskObj);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single task
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name avatar')
      .populate('createdBy', 'name avatar')
      .populate('comments.user', 'name avatar');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Transform for frontend
    const taskObj = task.toObject();
    if (taskObj.assignedTo) {
      taskObj.assignedToUser = {
        _id: taskObj.assignedTo._id,
        name: taskObj.assignedTo.name,
        avatar: taskObj.assignedTo.avatar,
      };
    }
    
    res.json(taskObj);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has permission (admin, manager, or task creator)
    const user = await User.findById(req.user.id);
    if (
      user.role !== 'admin' && 
      user.role !== 'manager' && 
      task.createdBy.toString() !== req.user.id && 
      task.assignedTo?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    // Store previous assigned user for notification
    const previousAssignedTo = task.assignedTo?.toString();
    
    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    
    await task.save();
    
    
    // Populate fields for response
    await task.populate('assignedTo', 'name avatar');
    await task.populate('createdBy', 'name avatar');
    await task.populate('comments.user', 'name avatar');
    
    // Transform for frontend
    const taskObj = task.toObject();
    if (taskObj.assignedTo) {
      taskObj.assignedToUser = {
        _id: taskObj.assignedTo._id,
        name: taskObj.assignedTo.name,
        avatar: taskObj.assignedTo.avatar,
      };
    }
    
    // Emit socket event
    const io = req.app.get('io');
    io.emit('task_updated', taskObj);
    
    // Send notifications
    if (assignedTo && assignedTo !== previousAssignedTo) {
      // Notify new assignee
      io.to(assignedTo.toString()).emit('notification', {
        type: 'task_assigned',
        message: `You have been assigned a task: ${task.title}`,
        task: taskObj._id,
      });
    }
    
    if (status === 'completed') {
      // Notify task creator if completed
      io.to(task.createdBy.toString()).emit('notification', {
        type: 'task_completed',
        message: `Task "${task.title}" has been marked as completed`,
        task: taskObj._id,
      });
    }
    
    res.json(taskObj);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has permission (admin, manager, or task creator)
    const user = await User.findById(req.user.id);
    if (
      user.role !== 'admin' && 
      user.role !== 'manager' && 
      task.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }
    
    await task.deleteOne();
    
    // Emit socket event
    const io = req.app.get('io');
    io.emit('task_deleted', req.params.id);
    
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a comment to a task
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const comment = {
      content,
      user: req.user.id,
    };
    
    task.comments.push(comment);
    await task.save();
    
    // Get the newly created comment with populated user
    const newComment = task.comments[task.comments.length - 1];
    await Task.populate(newComment, { path: 'user', select: 'name avatar' });
    
    // Emit socket event
    const io = req.app.get('io');
    io.emit('task_comment_added', {
      taskId: task._id,
      comment: newComment,
    });
    
    // Notify task creator and assignee
    const notifyUsers = new Set();
    notifyUsers.add(task.createdBy.toString());
    if (task.assignedTo) {
      notifyUsers.add(task.assignedTo.toString());
    }
    
    // Don't notify the commenter
    notifyUsers.delete(req.user.id);
    
    notifyUsers.forEach(userId => {
      io.to(userId).emit('notification', {
        type: 'task_comment',
        message: `New comment on task "${task.title}"`,
        task: task._id,
      });
    });
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
